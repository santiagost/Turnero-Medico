from typing import Optional


class EspecialidadBase:
    def __init__(self, nombre: str):
        self.nombre = nombre


class EspecialidadCreate(EspecialidadBase):
    def __init__(self, nombre: str, descripcion: Optional[str] = None):
        super().__init__(nombre)
        self.descripcion = descripcion


class EspecialidadUpdate:
    def __init__(self,
                 nombre: Optional[str] = None,
                 descripcion: Optional[str] = None):
        self.nombre = nombre
        self.descripcion = descripcion


class EspecialidadResponse(EspecialidadBase):
    def __init__(self,
                 nombre: str,
                 id_especialidad: int,
                 descripcion: Optional[str] = None):
        super().__init__(nombre)
        self.id_especialidad = id_especialidad
        self.descripcion = descripcion


