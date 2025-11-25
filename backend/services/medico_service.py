import sqlite3
from typing import List, Optional
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

    def create(self, medico_data: MedicoCreate) -> MedicoResponse:
        """Crea un nuevo médico"""
        try:
            # Validar DNI único
            self.cursor.execute("SELECT id_medico FROM medico WHERE dni = ?", (medico_data.dni,))
            if self.cursor.fetchone():
                raise ValueError(f"Ya existe un médico con DNI {medico_data.dni}")
            
            # Validar matrícula única
            self.cursor.execute("SELECT id_medico FROM medico WHERE matricula = ?", (medico_data.matricula,))
            if self.cursor.fetchone():
                raise ValueError(f"Ya existe un médico con matrícula {medico_data.matricula}")
            
            # Insertar nuevo médico
            self.cursor.execute("""
                INSERT INTO Medico (dni, nombre, apellido, matricula, telefono, id_especialidad, id_usuario)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                medico_data.dni,
                medico_data.nombre,
                medico_data.apellido,
                medico_data.matricula,
                medico_data.telefono,
                medico_data.id_especialidad,
                medico_data.id_usuario
            ))
            
            self.db.commit()
            
            # Obtener el médico recién creado
            medico_id = self.cursor.lastrowid
            return self._get_medico_completo(medico_id)
            
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

    


        