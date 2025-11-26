import sqlite3
from typing import List, Optional
from models.usuarioRol import UsuarioRolCreate
from models.medico import MedicoCreate, MedicoUpdate, MedicoResponse
from services.usuario_service import UsuarioService
from services.especialidad_service import EspecialidadService


class MedicoService:
    
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cursor = db.cursor()
    
    def _get_medico_completo(self, medico_id: int) -> Optional[MedicoResponse]:
        """Obtiene un médico con sus relaciones"""
        self.cursor.execute("SELECT * FROM medico WHERE id_medico = ?", (medico_id,))
        medico_row = self.cursor.fetchone()
        
        if not medico_row:
            return None
        
        medico_dict = dict(medico_row)
        
        # Obtener usuario completo usando UsuarioService
        usuario_obj = None
        if medico_dict.get('id_usuario'):
            usuario_service = UsuarioService(self.db)
            usuario_obj = usuario_service.get_by_id(medico_dict['id_usuario'])
        
        # Obtener especialidad completa usando EspecialidadService
        especialidad_obj = None
        if medico_dict.get('id_especialidad'):
            especialidad_service = EspecialidadService(self.db)
            especialidad_obj = especialidad_service.get_by_id(medico_dict['id_especialidad'])
        
        return MedicoResponse(
            id_medico=medico_dict['id_medico'],
            matricula=medico_dict['matricula'],
            dni=medico_dict['dni'],
            nombre=medico_dict['nombre'],
            apellido=medico_dict['apellido'],
            telefono=medico_dict.get('telefono'),
            id_usuario=medico_dict['id_usuario'],
            id_especialidad=medico_dict['id_especialidad'],
            usuario=usuario_obj,
            especialidad=especialidad_obj,
            noti_cancel_email_act=bool(medico_dict.get('noti_cancel_email_act', 1))
        )
    
    def get_all(self, 
                matricula: str = None, 
                dni: str = None, 
                nombre: str = None,
                apellido: str = None,
                id_medico: int = None,
                id_usuario: int = None,
                id_especialidad: int = None, 
                telefono: str = None) -> List[MedicoResponse]:

        """Obtiene todos los médicos"""
        sql = "SELECT id_medico FROM medico"

        condiciones = []
        valores = []

        if matricula:
            condiciones.append("matricula = ?")
            valores.append(matricula)

        if dni:
            condiciones.append("dni = ?")
            valores.append(dni)

        if nombre:
            condiciones.append("nombre = ?")
            valores.append(nombre)
        
        if apellido:
            condiciones.append("apellido = ?")
            valores.append(apellido)
            
        if id_medico:
            condiciones.append("id_medico = ?")
            valores.append(id_medico)

        if id_usuario:
            condiciones.append("id_usuario = ?")
            valores.append(id_usuario)

        if id_especialidad:
            condiciones.append("id_especialidad = ?")
            valores.append(id_especialidad)

        if telefono:
            condiciones.append("telefono = ?")
            valores.append(telefono)

        if condiciones:
            sql += " WHERE " + " AND ".join(condiciones)

        self.cursor.execute(sql, tuple(valores))
        rows = self.cursor.fetchall()
        
        medicos = []
        for row in rows:
            medico_id = dict(row)['id_medico']
            medico_completo = self._get_medico_completo(medico_id)
            if medico_completo:
                medicos.append(medico_completo)
        
        return medicos
    
    def get_by_id(self, medico_id: int) -> Optional[MedicoResponse]:
        """Obtiene un médico por su ID"""
        return self._get_medico_completo(medico_id)
    
    # devuelve {id, nombre-apellido}
    def get_ligero(self):
        """Obtiene una lista ligera de médicos (id, nombre, apellido)"""
        self.cursor.execute("""
            SELECT m.id_medico, m.nombre, m.apellido
            FROM medico m """)
        rows = self.cursor.fetchall()
        
        medicos_ligeros = []
        for row in rows:
            medico_dict = dict(row)
            medicos_ligeros.append({
                "id_medico": medico_dict['id_medico'],
                "nombre": medico_dict['nombre'],
                "apellido": medico_dict['apellido']
            })
        
        return medicos_ligeros

    def create(self, medico_data: dict) -> MedicoResponse:
        """Crea un nuevo médico"""

        from services.usuario_service import UsuarioService
        from services.rol_service import RolService
        from services.usuario_rol_service import UsuarioRolService

        usuario_service = UsuarioService(self.db)
        rol_service = RolService(self.db)
        usuario_rol_service = UsuarioRolService(self.db)

        # from services.especialidad_service import EspecialidadService

        try:

            usuario = usuario_service.get_by_email(medico_data['email'])
            
            if not usuario:
                usuario = usuario_service.create(
                    email=medico_data['email'],
                    password=medico_data.get('password', 'defaultpassword123')
                )
            

            roles = usuario_rol_service.get_by_usuario_id(usuario.id_usuario) if usuario else []
            if usuario and any(rol.rol.nombre == 'Medico' for rol in roles):
                raise ValueError(f"Ya existe un médico con el email {medico_data['email']}")
            
            # Validar DNI único
            self.cursor.execute("SELECT id_medico FROM medico WHERE dni = ?", (medico_data.get("dni"),))
            if self.cursor.fetchone():
                raise ValueError(f"Ya existe un médico con DNI { medico_data.get('dni') }")
            
            # Validar matrícula única
            self.cursor.execute("SELECT id_medico FROM medico WHERE matricula = ?", (medico_data.get("matricula"),))
            if self.cursor.fetchone():
                raise ValueError(f"Ya existe un médico con matrícula { medico_data.get('matricula') }")
            

            self.cursor.execute("""
                INSERT INTO Medico (dni, nombre, apellido, matricula, telefono, id_especialidad, id_usuario, noti_cancel_email_act)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                medico_data.get('dni'),
                medico_data.get('nombre'),
                medico_data.get('apellido'),
                medico_data.get('matricula'),
                medico_data.get('telefono'),
                medico_data.get('id_especialidad'),
                usuario.id_usuario,
                medico_data.get('noti_cancel_email_act', 1)
            ))
            self.db.commit()
            id_medico = self.cursor.lastrowid

            # Asignar rol de Médico al usuario
            usuario_rol_service.create(UsuarioRolCreate(usuario.id_usuario, rol_service.get_by_name('Medico').id_rol))

            return self._get_medico_completo(id_medico)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError(f"Error al crear el médico: {str(e)}")
    
    def update(self, medico_id: int, medico_data: MedicoUpdate) -> Optional[MedicoResponse]:
        """Actualiza los datos de un médico existente"""
        existing = self.get_by_id(medico_id)
        if not existing:
            return None
        
        try:
            update_fields = []
            update_values = []
            
            if medico_data.nombre is not None:
                update_fields.append("nombre = ?")
                update_values.append(medico_data.nombre)
            if medico_data.apellido is not None:
                update_fields.append("apellido = ?")
                update_values.append(medico_data.apellido)
            if medico_data.telefono is not None:
                update_fields.append("telefono = ?")
                update_values.append(medico_data.telefono)
            if medico_data.id_especialidad is not None:
                update_fields.append("id_especialidad = ?")
                update_values.append(medico_data.id_especialidad)
            
            if not update_fields:
                raise ValueError("No se proporcionaron campos para actualizar")
            
            update_values.append(medico_id)
            
            query = f"UPDATE Medico SET {', '.join(update_fields)} WHERE id_medico = ?"
            self.cursor.execute(query, update_values)
            self.db.commit()
            
            return self._get_medico_completo(medico_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError(f"Error al actualizar el médico: {str(e)}")
    
    def delete(self, medico_id: int) -> bool:
        """Elimina un médico por su ID"""
        existing = self.get_by_id(medico_id)
        if not existing:
            return False
        
        try:
            self.cursor.execute("DELETE FROM Medico WHERE id_medico = ?", (medico_id,))
            self.db.commit()
            return True
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError(f"Error al eliminar el médico: {str(e)}")
        

    # FUNCIONES DE NEGOCIO
    def get_pacientes_de_medico(self, medico_id: int) -> List[dict]:
        """Obtiene los pacientes asignados a un médico específico"""
        self.cursor.execute("""
            SELECT DISTINCT p.id_paciente, p.dni, p.nombre, p.apellido
            FROM Paciente p
            JOIN Turno t ON p.id_paciente = t.id_paciente
            WHERE t.id_medico = ?
        """, (medico_id,))
        
        rows = self.cursor.fetchall()
        pacientes = []
        for row in rows:
            paciente_dict = dict(row)
            pacientes.append(paciente_dict)
        
        return pacientes
    

    def get_by_usuario_id(self, id_usuario: int) -> Optional[MedicoResponse]:
        """Obtiene un médico por su ID de usuario"""
        self.cursor.execute("SELECT id_medico FROM medico WHERE id_usuario = ?", (id_usuario,))
        row = self.cursor.fetchone()

        if not row:
            return None

        medico_id = dict(row)['id_medico']
        return self._get_medico_completo(medico_id)

        