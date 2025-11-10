from typing import Optional

class EstadoTurnoBase:
    def __init__(self, nombre: str):
        self.nombre = nombre


class EstadoTurnoCreate(EstadoTurnoBase):
    def __init__(self, nombre: str, descripcion: Optional[str] = None):
        super().__init__(nombre)
        self.descripcion = descripcion


class EstadoTurnoUpdate:
    def __init__(self,
                 nombre: Optional[str] = None,
                 descripcion: Optional[str] = None):
        self.nombre = nombre
        self.descripcion = descripcion


class EstadoTurnoResponse(EstadoTurnoBase):
    def __init__(self,
                 nombre: str,
                 id_estado_turno: int,
                 descripcion: Optional[str] = None):
        super().__init__(nombre)
        self.id_estado_turno = id_estado_turno
        self.descripcion = descripcion