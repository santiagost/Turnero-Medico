import sqlite3
from typing import List, Optional
from models.paciente import PacienteResponse
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
            obra_social=obra_social_obj
        )
    
    def get_all(self) -> List[PacienteResponse]:
        """Obtiene todos los pacientes"""
        self.cursor.execute("SELECT id_paciente FROM Paciente")
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
    
    def create(self, paciente_data) -> PacienteResponse:
        """Crea un nuevo paciente"""
        try:
            # Validar DNI único
            self.cursor.execute("SELECT id_paciente FROM Paciente WHERE dni = ?", (paciente_data.dni,))
            if self.cursor.fetchone():
                raise ValueError(f"Ya existe un paciente con DNI {paciente_data.dni}")
            
            # Validar nro_afiliado único para la obra social
            if paciente_data.id_obra_social and paciente_data.nro_afiliado:
                self.cursor.execute(
                    "SELECT id_paciente FROM Paciente WHERE id_obra_social = ? AND nro_afiliado = ?",
                    (paciente_data.id_obra_social, paciente_data.nro_afiliado)
                )
                if self.cursor.fetchone():
                    raise ValueError(f"Ya existe un paciente con nro_afiliado {paciente_data.nro_afiliado} en la obra social")
            
            # Insertar nuevo paciente
            self.cursor.execute("""
                INSERT INTO Paciente (dni, nombre, apellido, fecha_nacimiento, telefono, id_obra_social, nro_afiliado, id_usuario)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                paciente_data.dni,
                paciente_data.nombre,
                paciente_data.apellido,
                paciente_data.fecha_nacimiento,
                paciente_data.telefono,
                paciente_data.id_obra_social,
                paciente_data.nro_afiliado,
                paciente_data.id_usuario
            ))
            
            self.db.commit()
            
            # Obtener el paciente recién creado
            paciente_id = self.cursor.lastrowid
            return self._get_paciente_completo(paciente_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al crear el paciente: " + str(e))
    
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
                update_fields.append("id_obra_social = ?")
                update_values.append(paciente_data.id_obra_social)
            if paciente_data.nro_afiliado is not None:
                update_fields.append("nro_afiliado = ?")
                update_values.append(paciente_data.nro_afiliado)
            
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
        """Elimina un paciente por su ID"""
        existing = self.get_by_id(paciente_id)
        if not existing:
            return False
        
        try:
            self.cursor.execute("DELETE FROM Paciente WHERE id_paciente = ?", (paciente_id,))
            self.db.commit()
            return True
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al eliminar el paciente: " + str(e))