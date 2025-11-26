import sqlite3
from typing import List, Optional
from models.paciente import PacienteResponse, PacienteCreate, PacienteUpdate
from models.usuarioRol import UsuarioRolCreate, UsuarioRolResponse
from services.usuario_service import UsuarioService
from services.obra_social_service import ObraSocialService


class PacienteService:
    
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cursor = db.cursor()
    
    def _get_paciente_completo(self, paciente_id: int) -> Optional[PacienteResponse]:
        """Obtiene un paciente con sus relaciones"""
        self.cursor.execute("""
            SELECT * FROM Paciente WHERE id_paciente = ?
        """, (paciente_id,))
        
        row = self.cursor.fetchone()
        
        if not row:
            return None
        
        paciente_dict = dict(row)
        
        # Obtener usuario completo usando UsuarioService
        usuario_obj = None
        if paciente_dict.get('id_usuario'):
            usuario_service = UsuarioService(self.db)
            usuario_obj = usuario_service.get_by_id(paciente_dict['id_usuario'])
        
        # Obtener obra social completa usando ObraSocialService
        obra_social_obj = None
        if paciente_dict.get('id_obra_social'):
            obra_social_service = ObraSocialService(self.db)
            obra_social_obj = obra_social_service.get_by_id(paciente_dict['id_obra_social'])
        
        return PacienteResponse(
            dni=paciente_dict['dni'],
            nombre=paciente_dict['nombre'],
            apellido=paciente_dict['apellido'],
            telefono=paciente_dict['telefono'],
            id_paciente=paciente_dict['id_paciente'],
            id_usuario=paciente_dict.get('id_usuario'),
            fecha_nacimiento=paciente_dict.get('fecha_nacimiento'),
            id_obra_social=paciente_dict.get('id_obra_social'),
            nro_afiliado=paciente_dict.get('nro_afiliado'),
            usuario=usuario_obj,
            obra_social=obra_social_obj,
            noti_reserva_email_act=bool(paciente_dict.get('noti_reserva_email_act'))
        )
    
    def get_all(self, id_paciente: Optional[int] = None, dni: Optional[str] = None, nombre: Optional[str] = None, apellido: Optional[str] = None, id_obra_social: Optional[int] = None) -> List[PacienteResponse]:
        """Obtiene todos los pacientes"""
        
        sql = "SELECT * FROM Paciente"
        params = []
        conditions = []

        if id_paciente is not None:
            conditions.append("id_paciente = ?")
            params.append(id_paciente)
        if dni is not None:
            conditions.append("dni = ?")
            params.append(dni)
        if nombre is not None:
            conditions.append("nombre LIKE ?")
            params.append(f"%{nombre}%")
        if apellido is not None:
            conditions.append("apellido LIKE ?")
            params.append(f"%{apellido}%")
        if id_obra_social is not None:
            conditions.append("id_obra_social = ?")
            params.append(id_obra_social)
        if conditions:
            sql += " WHERE " + " AND ".join(conditions)
        self.cursor.execute(sql, params)
        
        # self.cursor.execute("SELECT id_paciente FROM Paciente")
        rows = self.cursor.fetchall()
        
        pacientes = []
        for row in rows:
            paciente_id = dict(row)['id_paciente']
            paciente_completo = self._get_paciente_completo(paciente_id)
            if paciente_completo:
                pacientes.append(paciente_completo)
        
        return pacientes
    
    def get_by_id(self, paciente_id: int) -> Optional[PacienteResponse]:
        """Obtiene un paciente por su ID"""
        return self._get_paciente_completo(paciente_id)
    
    def update(self, paciente_id: int, paciente_data) -> Optional[PacienteResponse]:
        """Actualiza los datos de un paciente existente"""
        existing = self.get_by_id(paciente_id)
        if not existing:
            return None
        
        
        
        try:
            update_fields = []
            update_values = []
            
            if paciente_data.nombre is not None:
                update_fields.append("nombre = ?")
                update_values.append(paciente_data.nombre)
            if paciente_data.apellido is not None:
                update_fields.append("apellido = ?")
                update_values.append(paciente_data.apellido)
            if paciente_data.fecha_nacimiento is not None:
                update_fields.append("fecha_nacimiento = ?")
                update_values.append(paciente_data.fecha_nacimiento)
            if paciente_data.telefono is not None:
                update_fields.append("telefono = ?")
                update_values.append(paciente_data.telefono)
            if paciente_data.id_obra_social is not None:
                if paciente_data.nro_afiliado:
                    self.cursor.execute(
                        "SELECT id_paciente FROM Paciente WHERE id_obra_social = ? AND nro_afiliado = ?",
                        (paciente_data.id_obra_social, paciente_data.nro_afiliado)
                    )
                    if self.cursor.fetchone():
                        raise ValueError(f"Ya existe un paciente con nro_afiliado {paciente_data.nro_afiliado} en la obra social")
                    
                update_fields.append("id_obra_social = ?")
                update_values.append(paciente_data.id_obra_social)
            if paciente_data.nro_afiliado is not None:
                update_fields.append("nro_afiliado = ?")
                update_values.append(paciente_data.nro_afiliado)
            if paciente_data.noti_reserva_email_act is not None:
                update_fields.append("noti_reserva_email_act = ?")
                update_values.append(bool(paciente_data.noti_reserva_email_act))
            if paciente_data.id_usuario is not None:
                update_fields.append("id_usuario = ?")
                update_values.append(paciente_data.id_usuario)
            
            if not update_fields:
                raise ValueError("No se proporcionaron campos para actualizar")
            
            update_values.append(paciente_id)
            
            query = f"UPDATE Paciente SET {', '.join(update_fields)} WHERE id_paciente = ?"
            self.cursor.execute(query, update_values)
            self.db.commit()
            
            return self._get_paciente_completo(paciente_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al actualizar el paciente: " + str(e))
    
    def delete(self, paciente_id: int) -> bool:
        """Elimina un paciente por su ID y su usuario asociado si no tiene otro rol"""
        from services.usuario_rol_service import UsuarioRolService
        from services.usuario_service import UsuarioService
        usuario_rol_service = UsuarioRolService(self.db)
        usuario_service = UsuarioService(self.db)

        existing = self.get_by_id(paciente_id)
        if not existing:
            return False
        
        try:
            self.cursor.execute("DELETE FROM Paciente WHERE id_paciente = ?", (paciente_id,))
            self.db.commit()

            # Eliminar usuario asociado si no tiene otro rol
            if existing.id_usuario:
                roles = usuario_rol_service.get_by_usuario_id(existing.id_usuario)
                if len(roles) <= 1:
                    usuario_service.delete(existing.id_usuario)

            return True
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al eliminar el paciente: " + str(e))
    
    
    def get_by_dni(self, dni: str) -> Optional[PacienteResponse]:
        """Obtiene un paciente por su DNI"""
        self.cursor.execute("SELECT id_paciente FROM Paciente WHERE dni = ?", (dni,))
        row = self.cursor.fetchone()

        if not row:
            return None

        paciente_id = dict(row)['id_paciente']
        return self._get_paciente_completo(paciente_id)


    def get_by_usuario_id(self, id_usuario: int) -> Optional[PacienteResponse]:
        """Obtiene un paciente por su ID de usuario"""
        self.cursor.execute("SELECT id_paciente FROM Paciente WHERE id_usuario = ?", (id_usuario,))
        row = self.cursor.fetchone()

        if not row:
            return None

        paciente_id = dict(row)['id_paciente']
        return self._get_paciente_completo(paciente_id)


    def get_by_obra_social_y_nro_afiliado(self, id_obra_social: int, nro_afiliado: str) -> Optional[PacienteResponse]:
        """Obtiene un paciente por su obra social y número de afiliado"""
        self.cursor.execute("""
            SELECT id_paciente FROM Paciente 
            WHERE id_obra_social = ? AND nro_afiliado = ?
        """, (id_obra_social, nro_afiliado))
        row = self.cursor.fetchone()

        if not row:
            return None

        paciente_id = dict(row)['id_paciente']
        return self._get_paciente_completo(paciente_id)
    
    
    def create(self, usuario_data: dict) -> PacienteResponse:
        from services.usuario_rol_service import UsuarioRolService
        from services.rol_service import RolService
        from services.usuario_service import UsuarioService

        rol_service = RolService(self.db)
        usuario_rol_service = UsuarioRolService(self.db)
        usuario_service = UsuarioService(self.db)

        """Crea un nuevo usuario con rol de paciente"""
        try:
            # 1) Verificar si el email está en uso con rol Paciente
            exists = usuario_service.get_by_email(usuario_data["email"])
                        
            roles = usuario_rol_service.get_by_usuario_id(exists.id_usuario) if exists else []
            roles_names = [role.rol.nombre for role in roles] if roles else []

            if exists and "Paciente" in roles_names:
                raise ValueError("El email ya se encuentra registrado como Paciente")

            # 2) Buscar si existe el paciente por DNI
            paciente = self.get_by_dni(usuario_data["dni"])
            if paciente:
                raise ValueError("Ya existe un paciente con el DNI proporcionado")

            
                              
            self.cursor.execute("""
                INSERT INTO Paciente (dni, nombre, apellido, telefono, fecha_nacimiento, id_obra_social, nro_afiliado, noti_reserva_email_act)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                usuario_data["dni"],
                usuario_data["nombre"],
                usuario_data["apellido"],
                usuario_data.get("telefono"),
                usuario_data.get("fecha_nacimiento"),
                usuario_data.get("id_obra_social", 3),
                usuario_data.get("nro_afiliado", None),
                usuario_data.get("noti_reserva_email_act", 1)
            ))
            self.db.commit()
            id_paciente = self.cursor.lastrowid


            # 4) Crear usuario
            if exists:
                id_usuario = exists.id_usuario
            else:
                print("entro aca")
                usuario = usuario_service.create(
                    email=usuario_data["email"],
                    password=usuario_data.get("password", "defaultpassword123")
                )
                id_usuario = usuario.id_usuario


            # 5) Asociar usuario con paciente
            paciente_update = PacienteUpdate(id_usuario=id_usuario)
            self.update(id_paciente, paciente_update)

            # 6) Crear usuario rol
            rol = rol_service.get_by_name("Paciente")
            usuario_rol_service.create(
                UsuarioRolCreate(
                    id_usuario=id_usuario,
                    id_rol=rol.id_rol
                )
            )

            return self._get_paciente_completo(id_paciente)

        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al crear el usuario: " + str(e))