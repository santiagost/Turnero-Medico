
import sqlite3
from typing import List, Optional
from models.turno import TurnoCreate, TurnoResponse
from services.paciente_service import PacienteService
from services.medico_service import MedicoService
from services.estado_turno_service import EstadoTurnoService
from utils.email_sender import *

class TurnoService:
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cursor = db.cursor()

    def _get_turno_completo(self, row) -> TurnoResponse:
        turno_dict = dict(row)
        return TurnoResponse(
            id_turno=turno_dict['id_turno'],
            id_paciente=turno_dict['id_paciente'],
            id_medico=turno_dict['id_medico'],
            id_estado_turno=turno_dict['id_estado_turno'],
            fecha_hora_inicio=turno_dict['fecha_hora_inicio'],
            fecha_hora_fin=turno_dict['fecha_hora_fin'],
            motivo_consulta=turno_dict.get('motivo_consulta'),
            paciente=PacienteService(self.db).get_by_id(turno_dict['id_paciente']),
            medico=MedicoService(self.db).get_by_id(turno_dict['id_medico']),
            estado_turno=EstadoTurnoService(self.db).get_by_id(turno_dict['id_estado_turno'])
        )

    def get_all(self) -> List[TurnoResponse]:
        """Obtiene todos los turnos"""
        self.cursor.execute("SELECT * FROM turno")
        rows = self.cursor.fetchall()
        turnos = []
        for row in rows:
            turno_dict = dict(row)
            turnos.append(TurnoResponse(
                id_turno=turno_dict['id_turno'],
                id_paciente=turno_dict['id_paciente'],
                id_medico=turno_dict['id_medico'],
                id_estado_turno=turno_dict['id_estado_turno'],
                fecha_hora_inicio=turno_dict['fecha_hora_inicio'],
                fecha_hora_fin=turno_dict['fecha_hora_fin'],
                motivo_consulta=turno_dict.get('motivo_consulta'),
                paciente=PacienteService(self.db).get_by_id(turno_dict['id_paciente']),
                medico=MedicoService(self.db).get_by_id(turno_dict['id_medico']),
                estado_turno=EstadoTurnoService(self.db).get_by_id(turno_dict['id_estado_turno'])
            ))
        return turnos

    def get_by_id(self, turno_id: int) -> Optional[TurnoResponse]:
        """Obtiene un turno por ID"""
        self.cursor.execute("SELECT * FROM turno WHERE id_turno = ?", (turno_id,))
        row = self.cursor.fetchone()
        if row:
            turno_dict = dict(row)
            return TurnoResponse(
                id_turno=turno_dict['id_turno'],
                id_paciente=turno_dict['id_paciente'],
                id_medico=turno_dict['id_medico'],
                id_estado_turno=turno_dict['id_estado_turno'],
                fecha_hora_inicio=turno_dict['fecha_hora_inicio'],
                fecha_hora_fin=turno_dict['fecha_hora_fin'],
                motivo_consulta=turno_dict.get('motivo_consulta'),
                paciente=PacienteService(self.db).get_by_id(turno_dict['id_paciente']),
                medico=MedicoService(self.db).get_by_id(turno_dict['id_medico']),
                estado_turno=EstadoTurnoService(self.db).get_by_id(turno_dict['id_estado_turno'])
            )
        return None

    def create(self, turno_data: TurnoCreate) -> TurnoResponse:
        try:
            """Crea un nuevo turno"""
            self.cursor.execute(
                "INSERT INTO turno (fecha_hora_inicio, fecha_hora_fin, id_estado_turno, id_paciente, id_medico, motivo_consulta) VALUES (?, ?, ?, ?, ?, ?)",
                (turno_data.fecha_hora_inicio, turno_data.fecha_hora_fin, turno_data.id_estado_turno, turno_data.id_paciente, turno_data.id_medico, turno_data.motivo_consulta)
            )
            self.db.commit()
            turno_id = self.cursor.lastrowid
            return self.get_by_id(turno_id)
        
        except sqlite3.IntegrityError as e:
            raise ValueError("Error de integridad al crear el turno: " + str(e))
        

    def update(self, turno_id: int, turno_data: dict) -> Optional[TurnoResponse]:
        existing = self.get_by_id(turno_id)
        if not existing:
            return None
        
        fields = []
        values = []
        for key, value in turno_data.items():
            fields.append(f"{key} = ?")
            values.append(value)
        values.append(turno_id)

        sql = f"UPDATE turno SET {', '.join(fields)} WHERE id_turno = ?"
        self.cursor.execute(sql, values)
        self.db.commit()
        return self.get_by_id(turno_id)
    
    def delete(self, turno_id: int) -> bool:
        existing = self.get_by_id(turno_id)
        if not existing:
            return False
        
        try:
            self.cursor.execute("DELETE FROM turno WHERE id_turno = ?", (turno_id,))
            self.db.commit()
            return True
        except sqlite3.IntegrityError as e:
            raise ValueError("Error de integridad al actualizar el turno: " + str(e))
        

    def notificar_recordatorios_turnos(self):
        """
        Marca los turnos que deben ser notificados por recordatorio.
        """
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
                print(f"Paciente: {p.nombre}, Email: {p.usuario.email}")
                print(f"Medico: {m.nombre}, Email: {m.usuario.email}")

                EmailSender.send_email(
                    destinatario=p.usuario.email,
                    asunto="Recordatorio de turno médico",
                    cuerpo=f"Estimado/a {p.nombre}, le recordamos que tiene un turno programado con el Dr./Dra. {m.nombre} el día {i['fecha_hora_inicio']}."
                )
                EmailSender.send_email(
                    destinatario=m.usuario.email,
                    asunto="Recordatorio de turno médico",
                    cuerpo=f"Estimado/a Dr./Dra. {m.nombre}, le recordamos que tiene un turno programado con el paciente {p.nombre} el día {i['fecha_hora_inicio']}."
                )

                self.update(i['id_turno'], {'recordatorio_notificado': 1}) # funciona

            return len(turnos_a_notificar)

        except sqlite3.Error as e:
            raise ValueError("Error al notificar recordatorios de turnos: " + str(e))
        except Exception as e:
            raise ValueError("Error inesperado al notificar recordatorios de turnos: " + str(e))
    
        


