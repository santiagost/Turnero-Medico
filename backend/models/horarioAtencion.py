from typing import Optional


class HorarioAtencionBase:
    def __init__(self,
                 id_medico: int,
                 dia_semana: int,  # 0=Lunes, 1=Martes, ..., 6=Domingo
                 hora_inicio: str,
                 hora_fin: str,
                 duracion_turno_min: int = 30):
        self.id_medico = id_medico
        self.dia_semana = dia_semana
        self.hora_inicio = hora_inicio
        self.hora_fin = hora_fin
        self.duracion_turno_min = duracion_turno_min


class HorarioAtencionCreate(HorarioAtencionBase):
    def __init__(self,
                 id_medico: int,
                 dia_semana: int,
                 hora_inicio: str,
                 hora_fin: str,
                 duracion_turno_min: int = 30):
        super().__init__(id_medico, dia_semana, hora_inicio, hora_fin, duracion_turno_min)


class HorarioAtencionUpdate:
    def __init__(self,
                 dia_semana: Optional[int] = None,
                 hora_inicio: Optional[str] = None,
                 hora_fin: Optional[str] = None,
                 duracion_turno_min: Optional[int] = None):
        self.dia_semana = dia_semana
        self.hora_inicio = hora_inicio
        self.hora_fin = hora_fin
        self.duracion_turno_min = duracion_turno_min


class HorarioAtencionResponse(HorarioAtencionBase):
    def __init__(self,
                 id_horario_atencion: int,
                 id_medico: int,
                 dia_semana: int,
                 hora_inicio: str,
                 hora_fin: str,
                 duracion_turno_min: int = 30,
                 medico = None):  # MedicoResponse 
        super().__init__(id_medico, dia_semana, hora_inicio, hora_fin, duracion_turno_min)
        self.id_horario_atencion = id_horario_atencion
        self.medico = medico