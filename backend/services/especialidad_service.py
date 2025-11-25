import sqlite3
from typing import List, Optional
from models.especialidad import EspecialidadResponse, EspecialidadCreate, EspecialidadUpdate

class EspecialidadService:
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cursor = db.cursor()
        
    def _get_especialidad_completa(self, especialidad_id: int) -> Optional[EspecialidadResponse]:
        """Obtiene una especialidad completa por ID"""
        self.cursor.execute("SELECT * FROM especialidad WHERE id_especialidad = ?", (especialidad_id,))
        row = self.cursor.fetchone()
        if not row:
            return None
        
        especialidad_dict = dict(row)
        return EspecialidadResponse(
            id_especialidad=especialidad_dict['id_especialidad'],
            nombre=especialidad_dict['nombre'],
            descripcion=especialidad_dict.get('descripcion')
        )

    def get_all(self) -> List[EspecialidadResponse]:
        """Obtiene todas las especialidades"""
        self.cursor.execute("SELECT * FROM especialidad")
        rows = self.cursor.fetchall()
        especialidades = []
        for row in rows:
            especialidad_id = dict(row)['id_especialidad']
            especialidad_completa = self._get_especialidad_completa(especialidad_id)
            if especialidad_completa:
                especialidades.append(especialidad_completa)
        return especialidades

    def get_by_id(self, especialidad_id: int) -> Optional[EspecialidadResponse]:
        """Obtiene una especialidad por su ID"""
        return self._get_especialidad_completa(especialidad_id)

    def create(self, especialidad_data: EspecialidadCreate) -> EspecialidadResponse:
        """Crea una nueva especialidad"""
        try:
            self.cursor.execute("""
                INSERT INTO especialidad (nombre, descripcion)
                VALUES (?, ?)
            """, (
                especialidad_data.nombre,
                especialidad_data.descripcion
            ))
            
            self.db.commit()
            
            # Obtener la especialidad recién creada
            especialidad_id = self.cursor.lastrowid
            return self._get_especialidad_completa(especialidad_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al crear la especialidad: " + str(e))
        
    def update(self, especialidad_id: int, especialidad_data: dict) -> Optional[EspecialidadResponse]:
        """Actualiza los datos de una especialidad existente"""
        existing = self.get_by_id(especialidad_id)
        if not existing:
            return None
        
        try:
            nombre = especialidad_data.get('nombre', existing.nombre)
            descripcion = especialidad_data.get('descripcion', existing.descripcion)
            
            self.cursor.execute("""
                UPDATE especialidad SET nombre = ?, descripcion = ?
                WHERE id_especialidad = ?
            """, (nombre, descripcion, especialidad_id))
            
            self.db.commit()
            
            return self._get_especialidad_completa(especialidad_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al actualizar la especialidad: " + str(e))
    
    
    def delete(self, especialidad_id: int) -> bool:
        """Elimina una especialidad por su ID"""
        existing = self.get_by_id(especialidad_id)
        if not existing:
            return False
        
        try:
            self.cursor.execute("DELETE FROM especialidad WHERE id_especialidad = ?", (especialidad_id,))
            self.db.commit()
            return True
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al eliminar la especialidad: " + str(e))
        
    
