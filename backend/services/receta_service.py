import sqlite3
from typing import List, Optional
from models.receta import RecetaResponse, RecetaCreate, RecetaUpdate
from services.consulta_service import ConsultaService


class RecetaService:
    
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cursor = db.cursor()
    
    def _get_receta_completa(self, receta_id: int) -> Optional[RecetaResponse]:
        """Obtiene una receta con su consulta relacionada"""
        self.cursor.execute("""
            SELECT * FROM Receta WHERE id_receta = ?
        """, (receta_id,))
        
        row = self.cursor.fetchone()
        
        if not row:
            return None
        
        data = dict(row)
        
        # Obtener consulta completa usando ConsultaService
        consulta_obj = None
        if data.get('id_consulta'):
            consulta_service = ConsultaService(self.db)
            consulta_obj = consulta_service.get_by_id(data['id_consulta'])
        
        return RecetaResponse(
            id_receta=data['id_receta'],
            id_consulta=data['id_consulta'],
            medicamento=data['medicamento'],
            fecha_emision=data['fecha_emision'],
            dosis=data.get('dosis'),
            instrucciones=data.get('instrucciones'),
            consulta=consulta_obj
        )
    
    def get_all(self) -> List[RecetaResponse]:
        """Obtiene todas las recetas"""
        self.cursor.execute("SELECT id_receta FROM Receta")
        rows = self.cursor.fetchall()
        
        recetas = []
        for row in rows:
            receta_id = dict(row)['id_receta']
            receta_completa = self._get_receta_completa(receta_id)
            if receta_completa:
                recetas.append(receta_completa)
        
        return recetas
    
    def get_by_id(self, receta_id: int) -> Optional[RecetaResponse]:
        """Obtiene una receta por su ID"""
        return self._get_receta_completa(receta_id)
    
    def get_by_consulta_id(self, consulta_id: int) -> List[RecetaResponse]:
        """Obtiene todas las recetas de una consulta"""
        self.cursor.execute("SELECT id_receta FROM Receta WHERE id_consulta = ?", (consulta_id,))
        rows = self.cursor.fetchall()
        
        recetas = []
        for row in rows:
            receta_id = dict(row)['id_receta']
            receta_completa = self._get_receta_completa(receta_id)
            if receta_completa:
                recetas.append(receta_completa)
        
        return recetas
    
    def create(self, receta_data: RecetaCreate) -> RecetaResponse:
        """Crea una nueva receta"""
        try:
            # Validar que la consulta existe
            self.cursor.execute("SELECT id_consulta FROM Consulta WHERE id_consulta = ?", (receta_data.id_consulta,))
            if not self.cursor.fetchone():
                raise ValueError(f"No existe una consulta con ID {receta_data.id_consulta}")
            self.cursor.execute("""
                INSERT INTO Receta (id_consulta, medicamento, fecha_emision, dosis, instrucciones)
                VALUES (?, ?, ?, ?, ?)
            """, (
                receta_data.id_consulta,
                receta_data.medicamento,
                receta_data.fecha_emision,
                receta_data.dosis,
                receta_data.instrucciones
            ))
            
            self.db.commit()
            
            # Obtener la receta recién creada
            receta_id = self.cursor.lastrowid
            return self._get_receta_completa(receta_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al crear la receta: " + str(e))
    
    def update(self, receta_id: int, receta_data: RecetaUpdate) -> Optional[RecetaResponse]:
        """Actualiza los datos de una receta existente"""
        existing = self.get_by_id(receta_id)
        if not existing:
            return None
        
        try:
            update_fields = []
            update_values = []
            
            if receta_data.medicamento is not None:
                update_fields.append("medicamento = ?")
                update_values.append(receta_data.medicamento)
            if receta_data.dosis is not None:
                update_fields.append("dosis = ?")
                update_values.append(receta_data.dosis)
            if receta_data.instrucciones is not None:
                update_fields.append("instrucciones = ?")
                update_values.append(receta_data.instrucciones)
            
            if not update_fields:
                raise ValueError("No se proporcionaron campos para actualizar")
            
            update_values.append(receta_id)
            
            query = f"UPDATE Receta SET {', '.join(update_fields)} WHERE id_receta = ?"
            self.cursor.execute(query, update_values)
            self.db.commit()
            
            return self._get_receta_completa(receta_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al actualizar la receta: " + str(e))
    
    def delete(self, receta_id: int) -> bool:
        """Elimina una receta por su ID"""
        existing = self.get_by_id(receta_id)
        if not existing:
            return False
        
        try:
            self.cursor.execute("DELETE FROM Receta WHERE id_receta = ?", (receta_id,))
            self.db.commit()
            return True
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al eliminar la receta: " + str(e))
