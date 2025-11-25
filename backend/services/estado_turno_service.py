
import sqlite3
from typing import List, Optional
from models.estadoturno import EstadoTurnoCreate, EstadoTurnoResponse


class EstadoTurnoService:
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cursor = db.cursor()

    def _get_estado_turno_completo(self, estado_turno_id: int) -> Optional[EstadoTurnoResponse]:
        """Obtiene un estado de turno completo por ID"""
        self.cursor.execute("SELECT * FROM estadoturno WHERE id_estado_turno = ?", (estado_turno_id,))
        row = self.cursor.fetchone()
        if not row:
            return None
        
        estado_dict = dict(row)
        return EstadoTurnoResponse(
            id_estado_turno=estado_dict['id_estado_turno'],
            nombre=estado_dict['nombre'],
            descripcion=estado_dict['descripcion']
        )
    

        
    def get_all(self) -> List[EstadoTurnoResponse]:
        """Obtiene todos los estados de turno"""
        self.cursor.execute("SELECT * FROM estadoturno")
        rows = self.cursor.fetchall()
        estados = []
        for row in rows:
            estado_turno_id = dict(row)['id_estado_turno']
            estado_completo = self._get_estado_turno_completo(estado_turno_id)
            if estado_completo:
                estados.append(estado_completo)
        return estados
        

    def get_by_id(self, estado_turno_id: int) -> Optional[EstadoTurnoResponse]:
        """Obtiene un estado de turno por su ID"""
        return self._get_estado_turno_completo(estado_turno_id)
    

    def create(self, estado_data: EstadoTurnoCreate) -> EstadoTurnoResponse:
        """Crea un nuevo estado de turno"""
        try:
            self.cursor.execute("""
                INSERT INTO estadoturno (nombre, descripcion)
                VALUES (?, ?)
            """, (
                estado_data.nombre,
                estado_data.descripcion
            ))
            
            self.db.commit()
            
            # Obtener el estado recién creado
            estado_id = self.cursor.lastrowid
            return self._get_estado_turno_completo(estado_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al crear el estado de turno: " + str(e))
        
    def update(self, estado_turno_id: int, estado_data: dict) -> Optional[EstadoTurnoResponse]:
        """Actualiza los datos de un estado de turno existente"""
        existing = self.get_by_id(estado_turno_id)
        if not existing:
            return None
        
        try:
            nombre = estado_data.get('nombre', existing.nombre)
            descripcion = estado_data.get('descripcion', existing.descripcion)
            
            self.cursor.execute("""
                UPDATE estadoturno SET nombre = ?, descripcion = ?
                WHERE id_estado_turno = ?
            """, (nombre, descripcion, estado_turno_id))
            
            self.db.commit()
            
            return self._get_estado_turno_completo(estado_turno_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al actualizar el estado de turno: " + str(e))
        
    def delete(self, estado_turno_id: int) -> bool:
        """Elimina un estado de turno por su ID"""
        existing = self.get_by_id(estado_turno_id)
        if not existing:
            return False
        
        try:
            self.cursor.execute("DELETE FROM estadoturno WHERE id_estado_turno = ?", (estado_turno_id,))
            self.db.commit()
            return True
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al eliminar el estado de turno: " + str(e))
        

        
        
    


