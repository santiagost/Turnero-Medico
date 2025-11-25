from typing import Optional


class ConsultaBase:
    def __init__(self,
                 id_turno: int,
                 fecha_consulta: str):
        self.id_turno = id_turno
        self.fecha_consulta = fecha_consulta


class ConsultaCreate(ConsultaBase):
    def __init__(self,
                 id_turno: int,
                 fecha_consulta: str,
                 diagnostico: Optional[str] = None,
                 notas_privadas_medico: Optional[str] = None,
                 tratamiento: Optional[str] = None):
        super().__init__(id_turno, fecha_consulta)
        self.diagnostico = diagnostico
        self.notas_privadas_medico = notas_privadas_medico
        self.tratamiento = tratamiento


class ConsultaUpdate:
    def __init__(self,
                 diagnostico: Optional[str] = None,
                 notas_privadas_medico: Optional[str] = None,
                 tratamiento: Optional[str] = None):
        self.diagnostico = diagnostico
        self.notas_privadas_medico = notas_privadas_medico
        self.tratamiento = tratamiento


class ConsultaResponse(ConsultaBase):
    def __init__(self,
                 id_consulta: int,
                 id_turno: int,
                 fecha_consulta: str,
                 diagnostico: Optional[str] = None,
                 notas_privadas_medico: Optional[str] = None,
                 tratamiento: Optional[str] = None,
                 turno = None):  # TurnoResponse
        super().__init__(id_turno, fecha_consulta)
        self.id_consulta = id_consulta
        self.diagnostico = diagnostico
        self.notas_privadas_medico = notas_privadas_medico
        self.tratamiento = tratamiento
        self.turno = turno