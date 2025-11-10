from typing import Optional


class RolBase:
    def __init__(self, nombre: str):
        self.nombre = nombre


class RolCreate(RolBase):
    def __init__(self, nombre: str, descripcion: Optional[str] = None):
        super().__init__(nombre)
        self.descripcion = descripcion


class RolUpdate:
    def __init__(self, 
                 nombre: Optional[str] = None,
                 descripcion: Optional[str] = None):
        self.nombre = nombre
        self.descripcion = descripcion


class RolResponse(RolBase):
    def __init__(self, 
                 nombre: str,
                 id_rol: int,
                 descripcion: Optional[str] = None):
        super().__init__(nombre)
        self.id_rol = id_rol
        self.descripcion = descripcion