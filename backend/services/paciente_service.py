import sqlite3
from typing import List, Optional
from models.paciente import PacienteResponse, PacienteCreate, PacienteUpdate
from models.usuarioRol import UsuarioRolCreate, UsuarioRolResponse
from services.usuario_service import UsuarioService
from services.obra_social_service import ObraSocialService
from datetime import date


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
    
    def get_all(self, id_paciente: Optional[int] = None, dni: Optional[str] = None, nombre: Optional[str] = None, apellido: Optional[str] = None, id_obra_social: Optional[int] = None, id_usuario: Optional[int] = None) -> List[PacienteResponse]:
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
            conditions.append("LOWER(nombre) LIKE ?")
            params.append(f"%{nombre.lower()}%")
        if apellido is not None:
            conditions.append("LOWER(apellido) LIKE ?")
            params.append(f"%{apellido.lower()}%")
        if id_obra_social is not None:
            conditions.append("id_obra_social = ?")
            params.append(id_obra_social)
        if id_usuario is not None:
            conditions.append("id_usuario = ?")
            params.append(id_usuario)
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
    
    def update(self, paciente_id: int, paciente_data: PacienteUpdate) -> Optional[PacienteResponse]:
        """
        Actualiza los datos de un paciente existente. 
        Si la Obra Social es 'Particular' (la ID obtenida por consulta), el nro_afiliado se fuerza a NULL.
        """
        existing = self.get_by_id(paciente_id)
        if not existing:
            return None
        try:
            obra_social_service = ObraSocialService(self.db)
            obra_social_particular_id = obra_social_service.get_particular_os_id()
        except ValueError as e:
            raise ValueError("Error de configuración: No se encontró la Obra Social 'Particular'.")
        
        id_os_a_verificar = paciente_data.id_obra_social
        if id_os_a_verificar is None:
            id_os_a_verificar = existing.id_obra_social 
        if id_os_a_verificar == obra_social_particular_id:
            paciente_data.nro_afiliado = None
        
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
                self.validar_fecha_nacimiento(paciente_data.fecha_nacimiento)
                update_fields.append("fecha_nacimiento = ?")
                update_values.append(paciente_data.fecha_nacimiento)
            if paciente_data.telefono is not None:
                self.validar_telefono(paciente_data.telefono)
                update_fields.append("telefono = ?")
                update_values.append(paciente_data.telefono)
            if paciente_data.id_obra_social is not None:
                if paciente_data.nro_afiliado: 
                    self.cursor.execute(
                        """
                        SELECT id_paciente FROM Paciente 
                        WHERE id_obra_social = ? AND nro_afiliado = ? AND id_paciente != ?
                        """,
                        (paciente_data.id_obra_social, paciente_data.nro_afiliado, paciente_id) # Excluir el paciente actual
                    )
                    if self.cursor.fetchone():
                        raise ValueError(f"Ya existe otro paciente con nro_afiliado {paciente_data.nro_afiliado} en la obra social")
                        
                update_fields.append("id_obra_social = ?")
                update_values.append(paciente_data.id_obra_social)
                
            if hasattr(paciente_data, 'nro_afiliado') or paciente_data.nro_afiliado is None:
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

            # Ejecutar la consulta
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

            # Validar fecha de nacimiento debe ser anterior a hoy
            fecha_nacimiento = usuario_data.get("fecha_nacimiento")
            if fecha_nacimiento:
                self.validar_fecha_nacimiento(fecha_nacimiento)
            
            # Validar numero de telefono debe ser de 10 a 15 digitos
            telefono = usuario_data.get("telefono")
            if telefono:
                self.validar_telefono(telefono)

            # Validar dni de 7 u 8 dígitos
            dni_str = str(usuario_data["dni"])
            if dni_str:
                self.validar_dni(dni_str)

            # 3) Crear paciente                              
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
                    password=usuario_data.get("password", "Defaultpassword123")
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
    
    # Validaciones
    def validar_fecha_nacimiento(self, fecha_nacimiento: str):
        try:
            fecha_nac = date.fromisoformat(fecha_nacimiento)
        except ValueError:
            raise ValueError("La fecha de nacimiento debe tener el formato AAAA-MM-DD")
        
        if fecha_nac >= date.today():
            raise ValueError("La fecha de nacimiento debe ser anterior a la fecha actual")
    
    def validar_telefono(self, telefono: str):
        if telefono:
            telefono_str = str(telefono)
            if not (telefono_str.isdigit() and 10 <= len(telefono_str) <= 15):
                raise ValueError("El número de teléfono debe contener solo dígitos y tener una longitud entre 10 y 15 caracteres")
    
    def validar_dni(self, dni: str):
        dni_str = str(dni)
        if not (dni_str.isdigit() and len(dni_str) in [7, 8]):
            raise ValueError("El DNI debe contener solo dígitos y tener una longitud de 7 u 8 caracteres")