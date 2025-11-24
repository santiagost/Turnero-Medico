from typing import Optional


class TurnoBase:
    def __init__(self,
                 id_paciente: int,
                 id_medico: int,
                 fecha_hora_inicio: str,
                 fecha_hora_fin: str,
                 recordatorio_notificado: Optional[bool] = None,
                 reserva_notificada: Optional[bool] = None):
        self.id_paciente = id_paciente
        self.id_medico = id_medico
        self.fecha_hora_inicio = fecha_hora_inicio
        self.fecha_hora_fin = fecha_hora_fin
        self.recordatorio_notificado = recordatorio_notificado
        self.reserva_notificada = reserva_notificada

class TurnoCreate(TurnoBase):
    def __init__(self,
                 id_paciente: int,
                 id_medico: int,
                 fecha_hora_inicio: str,
                 fecha_hora_fin: str,
                 id_estado_turno: int = 1,
                 motivo_consulta: Optional[str] = None):
        super().__init__(id_paciente, id_medico, fecha_hora_inicio, fecha_hora_fin)
        self.id_estado_turno = id_estado_turno
        self.motivo_consulta = motivo_consulta


class TurnoUpdate:
    def __init__(self,
                 id_estado_turno: Optional[int] = None,
                 motivo_consulta: Optional[str] = None,
                 fecha_hora_inicio: Optional[str] = None,
                 fecha_hora_fin: Optional[str] = None):
        self.id_estado_turno = id_estado_turno
        self.motivo_consulta = motivo_consulta
        self.fecha_hora_inicio = fecha_hora_inicio
        self.fecha_hora_fin = fecha_hora_fin


class TurnoResponse(TurnoBase):
    def __init__(self,
                 id_turno: int,
                 id_paciente: int,
                 id_medico: int,
                 id_estado_turno: int,
                 fecha_hora_inicio: str,
                 fecha_hora_fin: str,
                 motivo_consulta: Optional[str] = None,
                 recordatorio_notificado: Optional[bool] = None,
                 reserva_notificada: Optional[bool] = None,
                 paciente = None,  # PacienteResponse 
                 medico = None,  # MedicoResponse 
                 estado_turno = None):  # EstadoTurnoResponse 
        super().__init__(id_paciente, id_medico, fecha_hora_inicio, fecha_hora_fin, recordatorio_notificado, reserva_notificada)
        self.id_turno = id_turno
        self.id_estado_turno = id_estado_turno
        self.motivo_consulta = motivo_consulta
        self.paciente = paciente
        self.medico = medico
        self.estado_turno = estado_turno
