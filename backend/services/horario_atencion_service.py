from datetime import date, datetime
import sqlite3
from typing import List, Optional
from models.horarioAtencion import HorarioAtencionResponse, HorarioAtencionCreate, HorarioAtencionUpdate
from services.medico_service import MedicoService


class HorarioAtencionService:
    
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cursor = db.cursor()
    
    def _get_horario_atencion_completo(self, horario_id: int) -> Optional[HorarioAtencionResponse]:
        """Obtiene un horario de atención con su médico relacionado"""
        self.cursor.execute("""
            SELECT * FROM HorarioAtencion WHERE id_horario_atencion = ?
        """, (horario_id,))
        
        row = self.cursor.fetchone()
        
        if not row:
            return None
        
        data = dict(row)
        
        # Obtener médico completo usando MedicoService
        medico_obj = None
        if data.get('id_medico'):
            medico_service = MedicoService(self.db)
            medico_obj = medico_service.get_by_id(data['id_medico'])
        
        return HorarioAtencionResponse(
            id_horario_atencion=data['id_horario_atencion'],
            id_medico=data['id_medico'],
            dia_semana=data['dia_semana'],
            hora_inicio=data['hora_inicio'],
            hora_fin=data['hora_fin'],
            duracion_turno_min=data['duracion_turno_min'],
            medico=medico_obj
        )
     
    def get_all(self) -> List[HorarioAtencionResponse]:
        """Obtiene todos los horarios de atención"""
        self.cursor.execute("SELECT id_horario_atencion FROM HorarioAtencion")
        rows = self.cursor.fetchall()
        
        horarios = []
        for row in rows:
            horario_id = dict(row)['id_horario_atencion']
            horario_completo = self._get_horario_atencion_completo(horario_id)
            if horario_completo:
                horarios.append(horario_completo)
        
        return horarios
    
    def get_by_id(self, horario_id: int) -> Optional[HorarioAtencionResponse]:
        """Obtiene un horario de atención por su ID"""
        return self._get_horario_atencion_completo(horario_id)
    

    """Aca esta completo el get_by_medico_id original, pero lo dejamos comentado para referencia futura"""
    # def get_by_medico_id(self, medico_id: int) -> List[HorarioAtencionResponse]:
    #     """Obtiene todos los horarios de atención de un médico"""
    #     self.cursor.execute("SELECT id_horario_atencion FROM HorarioAtencion WHERE id_medico = ?", (medico_id,))
    #     rows = self.cursor.fetchall()
        
    #     horarios = []
    #     for row in rows:
    #         horario_id = dict(row)['id_horario_atencion']
    #         horario_completo = self._get_horario_atencion_completo(horario_id)
    #         if horario_completo:
    #             horarios.append(horario_completo)
        
    #     return horarios


    def get_by_medico_id(self, medico_id: int) -> List[HorarioAtencionResponse]:
        """Obtiene todos los horarios de atención de un médico"""
        self.cursor.execute("SELECT * FROM HorarioAtencion WHERE id_medico = ?", (medico_id,))
        rows = self.cursor.fetchall()
        

        # De esta manera para aligerar la respuesta no traemos el medico relacionado por cada horario
        # por medico puede llegar a haber mas de 10 horarios por dia, y asi los 5 dias de la semana
        # es traer 50 veces el json completo del mismo medico en un solo get, muy pesado
        horarios = []
        for row in rows:
            horarios.append(HorarioAtencionResponse(
                id_horario_atencion=row['id_horario_atencion'],
                id_medico=row['id_medico'],
                dia_semana=row['dia_semana'],
                hora_inicio=row['hora_inicio'],
                hora_fin=row['hora_fin'],
                duracion_turno_min=row['duracion_turno_min']
                # medico = None (para evitar recursión)
            ))
            
        
        return horarios
    
    def create(self, horario_data: HorarioAtencionCreate) -> HorarioAtencionResponse:
        """Crea un nuevo horario de atención"""
        try:
            # Validar que el médico existe
            self.cursor.execute("SELECT id_medico FROM Medico WHERE id_medico = ?", (horario_data.id_medico,))
            if not self.cursor.fetchone():
                raise ValueError(f"No existe un médico con ID {horario_data.id_medico}")
            
            # Validar día de la semana (0-6)
            if horario_data.dia_semana < 0 or horario_data.dia_semana > 6:
                raise ValueError("El día de la semana debe estar entre 0 (Lunes) y 6 (Domingo)")
            
            # Insertar nuevo horario
            self.cursor.execute("""
                INSERT INTO HorarioAtencion (id_medico, dia_semana, hora_inicio, hora_fin, duracion_turno_min)
                VALUES (?, ?, ?, ?, ?)
            """, (
                horario_data.id_medico,
                horario_data.dia_semana,
                horario_data.hora_inicio,
                horario_data.hora_fin,
                horario_data.duracion_turno_min
            ))
            
            self.db.commit()
            
            # Obtener el horario recién creado
            horario_id = self.cursor.lastrowid
            return self._get_horario_atencion_completo(horario_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al crear el horario de atención: " + str(e))
    
    def update(self, horario_id: int, horario_data: HorarioAtencionUpdate) -> Optional[HorarioAtencionResponse]:
        """Actualiza los datos de un horario de atención existente"""
        existing = self.get_by_id(horario_id)
        if not existing:
            return None
        
        try:
            update_fields = []
            update_values = []
            
            if horario_data.dia_semana is not None:
                if horario_data.dia_semana < 0 or horario_data.dia_semana > 6:
                    raise ValueError("El día de la semana debe estar entre 0 (Lunes) y 6 (Domingo)")
                update_fields.append("dia_semana = ?")
                update_values.append(horario_data.dia_semana)
            if horario_data.hora_inicio is not None:
                update_fields.append("hora_inicio = ?")
                update_values.append(horario_data.hora_inicio)
            if horario_data.hora_fin is not None:
                update_fields.append("hora_fin = ?")
                update_values.append(horario_data.hora_fin)
            if horario_data.duracion_turno_min is not None:
                update_fields.append("duracion_turno_min = ?")
                update_values.append(horario_data.duracion_turno_min)
            
            if not update_fields:
                raise ValueError("No se proporcionaron campos para actualizar")
            
            update_values.append(horario_id)
            
            query = f"UPDATE HorarioAtencion SET {', '.join(update_fields)} WHERE id_horario_atencion = ?"
            self.cursor.execute(query, update_values)
            self.db.commit()
            
            return self._get_horario_atencion_completo(horario_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al actualizar el horario de atención: " + str(e))
    
    def delete(self, horario_id: int) -> bool:
        """Elimina un horario de atención por su ID"""
        existing = self.get_by_id(horario_id)
        if not existing:
            return False
        
        try:
            self.cursor.execute("DELETE FROM HorarioAtencion WHERE id_horario_atencion = ?", (horario_id,))
            self.db.commit()
            return True
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al eliminar el horario de atención: " + str(e))

    # funciones de negocio
    def esta_dentro_de_horario(self, id_medico: int, fecha_hora_inicio: str, fecha_hora_fin: str) -> bool:
        """Verifica si un médico está dentro de su horario de atención en una fecha y hora dada"""
        # dia_semana = fecha_hora_inicio.weekday()  # 0=lunes, 6=domingo

        fecha_hora_inicio_objeto = datetime.strptime(fecha_hora_inicio, "%Y-%m-%d %H:%M:%S")
        dia_semana = fecha_hora_inicio_objeto.weekday() # 0=lunes, 6=domingo 

        fecha_hora_fin_objeto = datetime.strptime(fecha_hora_fin, "%Y-%m-%d %H:%M:%S")
        
             


        self.cursor.execute("""
            SELECT ha.hora_inicio, ha.hora_fin
            FROM horarioatencion ha
            WHERE ha.id_medico = ? AND ha.dia_semana = ?
        """, (id_medico, dia_semana))

        horarios = self.cursor.fetchall()

        for horario in horarios:
            hora_inicio = horario['hora_inicio']
            hora_fin = horario['hora_fin']

            hora_inicio_objeto = datetime.strptime(hora_inicio, "%H:%M").time()
            hora_fin_objeto = datetime.strptime(hora_fin, "%H:%M").time()


            print("Comparando con horario:", hora_inicio_objeto, "-", hora_fin_objeto)
            print("Turno solicitado:", fecha_hora_inicio, "-", fecha_hora_fin)

            if hora_inicio_objeto <= fecha_hora_inicio_objeto.time() and hora_fin_objeto >= fecha_hora_fin_objeto.time():
                return True
        return False
    
    def crear_horarios_default_para_medico(self, id_medico: int):
        """Crea horarios de atención por defecto para un nuevo médico"""
        horarios_default = [
            # Lunes a Viernes de 09:00 a 17:00
            (id_medico, 0, "09:00", "17:00", 30),
            (id_medico, 1, "09:00", "17:00", 30),
            (id_medico, 2, "09:00", "17:00", 30),
            (id_medico, 3, "09:00", "17:00", 30),
            (id_medico, 4, "09:00", "17:00", 30),
        ]
        
        try:
            for horario in horarios_default:
                self.cursor.execute("""
                    INSERT INTO horarioatencion (id_medico, dia_semana, hora_inicio, hora_fin, duracion_turno_min)
                    VALUES (?, ?, ?, ?, ?)
                """, horario)
            self.db.commit()
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al crear horarios por defecto para el médico: " + str(e))
        
    def editar_horarios_medico(self, id_medico: int, horarios: List[HorarioAtencionCreate]) -> List[HorarioAtencionResponse]:
        """Edita los horarios de atención de un médico"""
        horarios_actualizados = []

        """Validamos que el medico exista"""
        self.cursor.execute("SELECT id_medico FROM Medico WHERE id_medico = ?", (id_medico,))
        if not self.cursor.fetchone():
            raise ValueError(f"No existe un médico con ID {id_medico}")
        
        """Borramos todos los horarios actuales del medico"""
        self.cursor.execute("DELETE FROM HorarioAtencion WHERE id_medico = ?", (id_medico,))
        self.db.commit()

        for horario_data in horarios:
            nuevo_horario = self.create(horario_data)
            horarios_actualizados.append(nuevo_horario)
            
        return horarios_actualizados
    

    
