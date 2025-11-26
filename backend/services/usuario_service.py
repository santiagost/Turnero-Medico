import sqlite3
from typing import List, Optional
from models.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from models.paciente import PacienteCreate, PacienteUpdate
from models.medico import MedicoUpdate
from utils.security import hash_password
from models.usuarioRol import UsuarioRolCreate


class UsuarioService:
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cursor = db.cursor()

    def _get_usuario_completo(self, usuario_id: int) -> Optional[UsuarioResponse]:
        """Obtiene un usuario completo por ID"""
        self.cursor.execute("SELECT * FROM usuario WHERE id_usuario = ?", (usuario_id,))
        row = self.cursor.fetchone()
        if not row:
            return None
        
        usuario_dict = dict(row)
        return UsuarioResponse(
            id_usuario=usuario_dict['id_usuario'],
            email=usuario_dict['email'],
            activo=bool(usuario_dict['activo']),
            recordatorios_activados=bool(usuario_dict['recordatorios_activados'])
        )

        
    def get_all(self) -> List[UsuarioResponse]:
        """Obtiene todos los usuarios"""
        self.cursor.execute("SELECT * FROM usuario")
        rows = self.cursor.fetchall()
        usuarios = []
        for row in rows:
            usuario_id = dict(row)['id_usuario']
            usuario_completo = self._get_usuario_completo(usuario_id)
            if usuario_completo:
                usuarios.append(usuario_completo)
        return usuarios
        

    def get_by_id(self, usuario_id: int) -> Optional[UsuarioResponse]:
        """Obtiene un usuario por su ID"""
        return self._get_usuario_completo(usuario_id)
    

    def create(self, usuario_data: dict) -> UsuarioResponse:
        from services.paciente_service import PacienteService
        from services.usuario_rol_service import UsuarioRolService
        from services.rol_service import RolService

        rol_service = RolService(self.db)
        usuario_rol_service = UsuarioRolService(self.db)
        paciente_service = PacienteService(self.db)

        """Crea un nuevo usuario"""
        try:
            # 1) Verificar si el email está en uso
            exists = self.cursor.execute(
                "SELECT id_usuario FROM usuario WHERE email = ?",
                (usuario_data["email"],)
            ).fetchone()

            if exists:
                raise ValueError("El email ya se encuentra registrado")

            # 2) Buscar si existe el paciente por DNI
            paciente = paciente_service.get_by_dni(usuario_data["dni"])

            # 3) Si no existe, crear paciente
            if not paciente:
                paciente = PacienteCreate(
                    nombre=usuario_data["nombre"],
                    apellido=usuario_data["apellido"],
                    dni=usuario_data["dni"],
                    telefono=usuario_data["telefono"],
                    fecha_nacimiento=usuario_data["fecha_nacimiento"]
                )
                paciente = paciente_service.create(paciente)

            # 4) Crear usuario
            password_hash = hash_password(usuario_data["password"])

            self.cursor.execute("""
                INSERT INTO usuario (email, password_hash, activo, recordatorios_activados)
                VALUES (?, ?, 1, 1)
            """, (usuario_data["email"], password_hash))

            self.db.commit()
            id_usuario = self.cursor.lastrowid

            # 5) Asociar usuario con paciente
            paciente_update = PacienteUpdate(id_usuario=id_usuario)
            paciente_service.update(paciente.id_paciente, paciente_update)

            # 6) Crear usuario rol
            rol = rol_service.get_by_name("Paciente")
            usuario_rol_service.create(
                UsuarioRolCreate(
                    id_usuario=id_usuario,
                    id_rol=rol.id_rol
                )
            )

            return self.get_by_id(id_usuario)

        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al crear el usuario: " + str(e))
        
        
    def update(self, usuario_id: int, usuario_data: dict) -> Optional[UsuarioResponse]:
        """Actualiza los datos de un usuario existente"""
        existing = self.get_by_id(usuario_id)
        if not existing:
            return None
        
        try:
            email = usuario_data.get('email', existing.email)
            activo = usuario_data.get('activo', existing.activo)
            
            self.cursor.execute("""
                UPDATE usuario SET email = ?, activo = ?
                WHERE id_usuario = ?
            """, (email, activo, usuario_id))
            
            self.db.commit()
            
            return self._get_usuario_completo(usuario_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al actualizar el usuario: " + str(e))
        
    def delete(self, usuario_id: int) -> bool:
        """Elimina un usuario por su ID"""
        existing = self.get_by_id(usuario_id)
        if not existing:
            return False
        
        try:
            self.cursor.execute("DELETE FROM usuario WHERE id_usuario = ?", (usuario_id,))
            self.db.commit()
            return True
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al eliminar el usuario: " + str(e))
    

    def editar_perfil(self, id_usuario: int, usuario_update: dict) -> Optional[UsuarioResponse]:
        """Modifica los datos de un usuario:
        - si es paciente puede modificar telefono, obra social y numero de afiliado
        - si es medico puede modificar telefono"""
        from services.paciente_service import PacienteService
        from services.medico_service import MedicoService
        from services.usuario_rol_service import UsuarioRolService
        from services.obra_social_service import ObraSocialService

        usuario_rol_service = UsuarioRolService(self.db)
        paciente_service = PacienteService(self.db)
        medico_service = MedicoService(self.db)
        obra_social_service = ObraSocialService(self.db)

        usuario = self.get_by_id(id_usuario)
        if not usuario:
            raise ValueError("El usuario no existe")

        obra_social = None
        if usuario_update.get("obra_social"):
            obra_social = obra_social_service.get_by_name(usuario_update.get("obra_social"))
            if not obra_social:
                raise ValueError("La obra social proporcionada no existe")

        roles = usuario_rol_service.get_by_usuario_id(usuario.id_usuario)
        role_names = [role.rol.nombre for role in roles]

        if "Paciente" not in role_names and usuario_update.get("rol") == "Paciente":
            raise ValueError("El usuario no tiene el rol de Paciente")
        
        if "Medico" not in role_names and usuario_update.get("rol") == "Medico":
            raise ValueError("El usuario no tiene el rol de Médico")

        if "Paciente" in role_names:
            paciente = paciente_service.get_by_usuario_id(usuario.id_usuario)
            if not paciente:
                raise ValueError("El paciente asociado al usuario no existe")

            # Verifica que no exista un paciente con la misma obra social y nro afiliado
            if obra_social and usuario_update.get("nro_afiliado"):
                existing_paciente = paciente_service.get_by_obra_social_y_nro_afiliado(
                    obra_social.id_obra_social,
                    usuario_update.get("nro_afiliado")
                )
                if existing_paciente and existing_paciente.id_paciente != paciente.id_paciente:
                    raise ValueError("Ya existe un paciente con la misma obra social y número de afiliado")

            paciente_data = PacienteUpdate(
                telefono=usuario_update.get("telefono", paciente.telefono),
                id_obra_social=obra_social.id_obra_social,
                nro_afiliado=usuario_update.get("nro_afiliado", paciente.nro_afiliado)
            )
            paciente_service.update(paciente.id_paciente, paciente_data)

        elif "Medico" in role_names:
            """Solo se modifica para los médicos"""
            medico = medico_service.get_by_usuario_id(usuario.id_usuario)
            if not medico:
                raise ValueError("El médico asociado al usuario no existe")

            medico_data = MedicoUpdate(
                telefono=usuario_update.get("telefono", medico.telefono)
            )
            medico_service.update(medico.id_medico, medico_data)

        return self.get_by_id(usuario.id_usuario)