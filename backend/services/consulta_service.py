import sqlite3
from typing import List, Optional
from models.consulta import ConsultaResponse, ConsultaCreate, ConsultaUpdate
from services.turno_service import TurnoService


class ConsultaService:
    
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cursor = db.cursor()
    
    def _get_consulta_completa(self, consulta_id: int) -> Optional[ConsultaResponse]:
        """Obtiene una consulta con su turno relacionado"""
        self.cursor.execute("""
            SELECT * FROM Consulta WHERE id_consulta = ?
        """, (consulta_id,))
        
        row = self.cursor.fetchone()
        
        if not row:
            return None
        
        consulta_dict = dict(row)
        
        # Obtener turno completo usando TurnoService
        turno_obj = None
        if consulta_dict.get('id_turno'):
            turno_service = TurnoService(self.db)
            turno_obj = turno_service.get_by_id(consulta_dict['id_turno'])
        
        return ConsultaResponse(
            id_consulta=consulta_dict['id_consulta'],
            id_turno=consulta_dict['id_turno'],
            fecha_consulta=consulta_dict['fecha_consulta'],
            diagnostico=consulta_dict.get('diagnostico'),
            notas_privadas_medico=consulta_dict.get('notas_privadas_medico'),
            tratamiento=consulta_dict.get('tratamiento'),
            turno=turno_obj,
        )
    
    def get_all(self) -> List[ConsultaResponse]:
        """Obtiene todas las consultas"""
        self.cursor.execute("SELECT id_consulta FROM Consulta")
        rows = self.cursor.fetchall()
        
        consultas = []
        for row in rows:
            consulta_id = dict(row)['id_consulta']
            consulta_completa = self._get_consulta_completa(consulta_id)
            if consulta_completa:
                consultas.append(consulta_completa)
        
        return consultas
    
    def get_by_id(self, consulta_id: int) -> Optional[ConsultaResponse]:
        """Obtiene una consulta por su ID"""
        return self._get_consulta_completa(consulta_id)
    
    def get_id_pacientes_by_fecha_consulta(self, fecha_consulta: str) -> List[int]:
        """Obtiene LISTA de IDs de pacientes para una fecha (YYYY-MM-DD)"""
        
        # Usamos DISTINCT para que si un paciente fue 2 veces, no salga repetido
        self.cursor.execute("""
            SELECT DISTINCT T.id_paciente
            FROM Consulta C
            JOIN Turno T ON C.id_turno = T.id_turno
            WHERE DATE(C.fecha_consulta) = DATE(?)
        """, (fecha_consulta,))
        
        rows = self.cursor.fetchall()
        
        # Convertimos la lista de tuplas [(1,), (5,)] en lista de enteros [1, 5]
        lista_ids = [row[0] for row in rows]
        
        return lista_ids
    
    def get_id_consultas_by_fecha_consulta(self, fecha_consulta: str) -> List[int]:
        """Obtiene LISTA de IDs de consultas para una fecha (YYYY-MM-DD)"""
        
        # Usamos DISTINCT para que si un paciente fue 2 veces, no salga repetido
        self.cursor.execute("""
            SELECT id_consulta
            FROM Consulta
            WHERE DATE(fecha_consulta) = DATE(?)
        """, (fecha_consulta,))
        
        rows = self.cursor.fetchall()
        
        # Convertimos la lista de tuplas [(1,), (5,)] en lista de enteros [1, 5]
        lista_ids = [row[0] for row in rows]
        
        return lista_ids

    def create(self, consulta_data: ConsultaCreate) -> ConsultaResponse:
        """Crea una nueva consulta"""
        try:
            # Validar que el turno existe
            self.cursor.execute("SELECT id_turno FROM Turno WHERE id_turno = ?", (consulta_data.id_turno,))
            if not self.cursor.fetchone():
                raise ValueError(f"No existe un turno con ID {consulta_data.id_turno}")
            
            # Validar que el turno no tenga ya una consulta (id_turno es UNIQUE)
            self.cursor.execute("SELECT id_consulta FROM Consulta WHERE id_turno = ?", (consulta_data.id_turno,))
            if self.cursor.fetchone():
                raise ValueError(f"El turno {consulta_data.id_turno} ya tiene una consulta registrada")
            
            # Insertar nueva consulta
            self.cursor.execute("""
                INSERT INTO Consulta (id_turno, fecha_consulta, diagnostico, notas_privadas_medico, tratamiento)
                VALUES (?, ?, ?, ?, ?)
            """, (
                consulta_data.id_turno,
                consulta_data.fecha_consulta,
                consulta_data.diagnostico,
                consulta_data.notas_privadas_medico,
                consulta_data.tratamiento
            ))
            
            self.db.commit()
            
            # Obtener la consulta recién creada
            consulta_id = self.cursor.lastrowid
            return self._get_consulta_completa(consulta_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al crear la consulta: " + str(e))
    
    def update(self, consulta_id: int, consulta_data: ConsultaUpdate) -> Optional[ConsultaResponse]:
        """Actualiza los datos de una consulta existente"""
        existing = self.get_by_id(consulta_id)
        if not existing:
            return None
        
        try:
            update_fields = []
            update_values = []
            
            if consulta_data.diagnostico is not None:
                update_fields.append("diagnostico = ?")
                update_values.append(consulta_data.diagnostico)
            if consulta_data.notas_privadas_medico is not None:
                update_fields.append("notas_privadas_medico = ?")
                update_values.append(consulta_data.notas_privadas_medico)
            if consulta_data.tratamiento is not None:
                update_fields.append("tratamiento = ?")
                update_values.append(consulta_data.tratamiento)
            
            if not update_fields:
                raise ValueError("No se proporcionaron campos para actualizar")
            
            update_values.append(consulta_id)
            
            query = f"UPDATE Consulta SET {', '.join(update_fields)} WHERE id_consulta = ?"
            self.cursor.execute(query, update_values)
            self.db.commit()
            
            return self._get_consulta_completa(consulta_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al actualizar la consulta: " + str(e))
    
    def delete(self, consulta_id: int) -> bool:
        """Elimina una consulta por su ID"""
        existing = self.get_by_id(consulta_id)
        if not existing:
            return False
        
        try:
            self.cursor.execute("DELETE FROM Consulta WHERE id_consulta = ?", (consulta_id,))
            self.db.commit()
            return True
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al eliminar la consulta: " + str(e))
        
    def get_by_paciente_id(self, paciente_id: int) -> List[ConsultaResponse]:
        """Obtiene todas las consultas asociadas a un paciente específico"""
        self.cursor.execute("""
            SELECT C.id_consulta
            FROM Consulta C
            JOIN Turno T ON C.id_turno = T.id_turno
            WHERE T.id_paciente = ?
        """, (paciente_id,))
        
        rows = self.cursor.fetchall()
        
        consultas = []
        for row in rows:
            consulta_id = dict(row)['id_consulta']
            consulta_completa = self._get_consulta_completa(consulta_id)
            if consulta_completa:
                consultas.append(consulta_completa)
        
        return consultas
    
    


        

        