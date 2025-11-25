
import sqlite3
from typing import List, Optional
from models.turno import TurnoCreate, TurnoResponse
from services.paciente_service import PacienteService
from services.medico_service import MedicoService
from services.estado_turno_service import EstadoTurnoService
from services.horario_atencion_service import HorarioAtencionService
from utils.email_sender import *



class TurnoService:
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cursor = db.cursor()

    def _hay_solapamiento_turnos(self, id_persona: int, fecha_hora_inicio: str, fecha_hora_fin: str, es_medico: bool) -> bool:
        """Verifica si hay solapamiento de turnos para un médico o paciente"""
        campo_id = 'id_medico' if es_medico else 'id_paciente'
        
        self.cursor.execute(f"""
            SELECT COUNT(*) as count FROM turno
            WHERE {campo_id} = ?
            AND (
                (datetime(fecha_hora_inicio) < datetime(?) AND datetime(fecha_hora_fin) > datetime(?))
                OR
                (datetime(fecha_hora_inicio) >= datetime(?) AND datetime(fecha_hora_inicio) < datetime(?))
                OR
                (datetime(fecha_hora_fin) > datetime(?) AND datetime(fecha_hora_fin) <= datetime(?))
            )
        """, (id_persona, fecha_hora_fin, fecha_hora_inicio, fecha_hora_inicio, fecha_hora_fin, fecha_hora_inicio, fecha_hora_fin))
        
        row = self.cursor.fetchone()

        return row['count'] > 0

    
    def _es_turno_valido(self, turno_data: TurnoCreate) -> bool:
        """Valida si un turno cumple con las reglas de negocio"""
        
        # - El turno no se solapa con otros turnos del mismo médico
        # - El turno está dentro del horario laboral del médico 
        # - El paciente no tiene otro turno en el mismo horario

        esta_dentro_horario = HorarioAtencionService(self.db).esta_dentro_de_horario(
            id_medico=turno_data.id_medico,
            fecha_hora_inicio=turno_data.fecha_hora_inicio,
            fecha_hora_fin=turno_data.fecha_hora_fin
        )

        id_medico = turno_data.id_medico
        id_paciente = turno_data.id_paciente

        hay_solapamiento_medico = self._hay_solapamiento_turnos(
            id_persona=id_medico,
            fecha_hora_inicio=turno_data.fecha_hora_inicio,
            fecha_hora_fin=turno_data.fecha_hora_fin,
            es_medico=True
        )

        hay_solapamiento_paciente = self._hay_solapamiento_turnos(
            id_persona=id_paciente,
            fecha_hora_inicio=turno_data.fecha_hora_inicio,
            fecha_hora_fin=turno_data.fecha_hora_fin,
            es_medico=False
        )

        print(f"Intento post creacion turno: Medico {id_medico}, Paciente {id_paciente}, Inicio {turno_data.fecha_hora_inicio}, Fin {turno_data.fecha_hora_fin}")
        print(f"Dentro horario? {esta_dentro_horario} | Solapamiento medico? {hay_solapamiento_medico} | Solapamiento paciente? {hay_solapamiento_paciente}")
        
        if not esta_dentro_horario:
            raise ValueError("El turno no está dentro del horario de atención del médico")
        
        if hay_solapamiento_medico:
            raise ValueError("El medico tiene otro turno en el mismo horario")
        
        if hay_solapamiento_paciente:
            raise ValueError("El paciente tiene otro turno en el mismo horario")
        
        return True

    def _get_turno_completo(self, turno_id: int) -> Optional[TurnoResponse]:
        """Obtiene un turno con sus relaciones"""
        self.cursor.execute("SELECT * FROM turno WHERE id_turno = ?", (turno_id,))
        row = self.cursor.fetchone()
        
        if not row:
            return None
        
        turno_dict = dict(row)
        
        # Obtener relaciones usando sus servicios
        paciente_obj = None
        if turno_dict.get('id_paciente'):
            paciente_obj = PacienteService(self.db).get_by_id(turno_dict['id_paciente'])
        
        medico_obj = None
        if turno_dict.get('id_medico'):
            medico_obj = MedicoService(self.db).get_by_id(turno_dict['id_medico'])
        
        estado_turno_obj = None
        if turno_dict.get('id_estado_turno'):
            estado_turno_obj = EstadoTurnoService(self.db).get_by_id(turno_dict['id_estado_turno'])
        
        return TurnoResponse(
            id_turno=turno_dict['id_turno'],
            id_paciente=turno_dict['id_paciente'],
            id_medico=turno_dict['id_medico'],
            id_estado_turno=turno_dict['id_estado_turno'],
            fecha_hora_inicio=turno_dict['fecha_hora_inicio'],
            fecha_hora_fin=turno_dict['fecha_hora_fin'],
            motivo_consulta=turno_dict.get('motivo_consulta'),
            recordatorio_notificado=bool(turno_dict.get('recordatorio_notificado', 0)),
            reserva_notificada=bool(turno_dict.get('reserva_notificada', 0)),
            paciente=paciente_obj,
            medico=medico_obj,
            estado_turno=estado_turno_obj
        )

    def get_all(self) -> List[TurnoResponse]:
        """Obtiene todos los turnos"""
        self.cursor.execute("SELECT id_turno FROM turno")
        rows = self.cursor.fetchall()
        
        turnos = []
        for row in rows:
            turno_id = dict(row)['id_turno']
            turno_completo = self._get_turno_completo(turno_id)
            if turno_completo:
                turnos.append(turno_completo)
        
        return turnos

    def get_by_id(self, turno_id: int) -> Optional[TurnoResponse]:
        """Obtiene un turno por su ID"""
        return self._get_turno_completo(turno_id)

    def get_proximos_turnos_paciente(self, paciente_id: int) -> List[TurnoResponse]:
        """Obtiene los próximos turnos de un paciente"""
        self.cursor.execute("""
            SELECT id_turno FROM turno
            WHERE id_paciente = ? AND datetime(fecha_hora_inicio) > datetime('now', 'localtime')
            ORDER BY fecha_hora_inicio ASC
        """, (paciente_id,))
        
        rows = self.cursor.fetchall()
        
        turnos = []
        for row in rows:
            turno_id = dict(row)['id_turno']
            turno_completo = self._get_turno_completo(turno_id)
            if turno_completo:
                turnos.append(turno_completo)
        
        return turnos

    def get_historial_desde_hasta(self, paciente_id: int, fecha_desde: str, fecha_hasta: str) -> List[TurnoResponse]:
        """Obtiene el historial de turnos de un paciente entre dos fechas"""
        self.cursor.execute("""
            SELECT id_turno FROM turno
            WHERE id_paciente = ? AND date(fecha_hora_inicio) BETWEEN date(?) AND date(?)
            ORDER BY fecha_hora_inicio DESC
        """, (paciente_id, fecha_desde, fecha_hasta))
        
        rows = self.cursor.fetchall()
        
        turnos = []
        for row in rows:
            turno_id = dict(row)['id_turno']
            turno_completo = self._get_turno_completo(turno_id)
            if turno_completo:
                turnos.append(turno_completo)
        
        return turnos
    
    def get_agenda_desde_hasta(self, id_medico: int, fecha_desde: str, fecha_hasta: str) -> List[TurnoResponse]:
        """Obtiene la agenda de un médico entre dos fechas"""
        self.cursor.execute("""
            SELECT id_turno FROM turno
            WHERE id_medico = ? AND date(fecha_hora_inicio) BETWEEN date(?) AND date(?)
            ORDER BY fecha_hora_inicio ASC
        """, (id_medico, fecha_desde, fecha_hasta))
        
        rows = self.cursor.fetchall()
        
        turnos = []
        for row in rows:
            turno_id = dict(row)['id_turno']
            turno_completo = self._get_turno_completo(turno_id)
            if turno_completo:
                turnos.append(turno_completo)
        
        return turnos

    def create(self, turno_data: TurnoCreate) -> TurnoResponse:
        """Crea un nuevo turno"""

        self._es_turno_valido(turno_data)
       
        try:

            if not self._es_turno_valido(turno_data):
                raise ValueError("El turno no cumple con las reglas de negocio")

            # Insertar nuevo turno
            self.cursor.execute("""
                INSERT INTO turno (fecha_hora_inicio, fecha_hora_fin, id_estado_turno, id_paciente, id_medico, motivo_consulta)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                turno_data.fecha_hora_inicio,
                turno_data.fecha_hora_fin,
                turno_data.id_estado_turno,
                turno_data.id_paciente,
                turno_data.id_medico,
                turno_data.motivo_consulta
            ))
            
            self.db.commit()
            
            # Obtener el turno recién creado
            turno_id = self.cursor.lastrowid
            return self._get_turno_completo(turno_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al crear el turno: " + str(e))
        
    def update(self, turno_id: int, turno_data: dict) -> Optional[TurnoResponse]:
        """Actualiza los datos de un turno existente"""
        existing = self.get_by_id(turno_id)
        if not existing:
            return None
        
        try:
            update_fields = []
            update_values = []
            
            for key, value in turno_data.items():
                update_fields.append(f"{key} = ?")
                update_values.append(value)
            
            if not update_fields:
                raise ValueError("No se proporcionaron campos para actualizar")
            
            update_values.append(turno_id)
            
            query = f"UPDATE turno SET {', '.join(update_fields)} WHERE id_turno = ?"
            self.cursor.execute(query, update_values)
            self.db.commit()
            
            return self._get_turno_completo(turno_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al actualizar el turno: " + str(e))
    
    def delete(self, turno_id: int) -> bool:
        """Elimina un turno por su ID"""
        existing = self.get_by_id(turno_id)
        if not existing:
            return False
        
        try:
            self.cursor.execute("DELETE FROM turno WHERE id_turno = ?", (turno_id,))
            self.db.commit()
            return True
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al eliminar el turno: " + str(e))
        
    def notificar_recordatorios_turnos(self):
        """Marca los turnos que deben ser notificados por recordatorio"""
        try:
            self.cursor.execute("""
                SELECT id_turno, fecha_hora_inicio, id_paciente, id_medico FROM Turno
                WHERE id_estado_turno = (
                    SELECT id_estado_turno FROM EstadoTurno WHERE nombre = 'Pendiente'
                )
                AND datetime(fecha_hora_inicio) BETWEEN datetime('now', 'localtime') AND datetime('now', 'localtime', '+1 day')
                AND recordatorio_notificado = 0
                """)

            
            
            turnos_a_notificar = self.cursor.fetchall()
            

            for i in turnos_a_notificar:
                p = PacienteService(self.db).get_by_id(i['id_paciente'])
                m = MedicoService(self.db).get_by_id(i['id_medico'])
                
                if p.usuario.recordatorios_activados:
                    EmailSender.send_email(
                        destinatario=p.usuario.email,
                        asunto="Recordatorio de turno médico",
                        cuerpo=f"Estimado/a {p.nombre}, le recordamos que tiene un turno programado con el Dr./Dra. {m.nombre} el día {i['fecha_hora_inicio']}."
                    )

                if m.usuario.recordatorios_activados:
                    EmailSender.send_email(
                        destinatario=m.usuario.email,
                        asunto="Recordatorio de turno médico",
                        cuerpo=f"Estimado/a Dr./Dra. {m.nombre}, le recordamos que tiene un turno programado con el paciente {p.nombre} el día {i['fecha_hora_inicio']}."
                    )

                self.update(i['id_turno'], {'recordatorio_notificado': True}) # funciona

            return len(turnos_a_notificar)

        except sqlite3.Error as e:
            raise ValueError("Error al notificar recordatorios de turnos: " + str(e))
        except Exception as e:
            raise ValueError("Error inesperado al notificar recordatorios de turnos: " + str(e))
    
        


