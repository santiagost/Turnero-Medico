from typing import Optional


class ObraSocialBase:
    def __init__(self, nombre: str):
        self.nombre = nombre


class ObraSocialCreate(ObraSocialBase):
    def __init__(self, 
                 nombre: str,
                 cuit: Optional[str] = None,
                 direccion: Optional[str] = None,
                 telefono: Optional[str] = None,
                 mail: Optional[str] = None):
        super().__init__(nombre)
        self.cuit = cuit
        self.direccion = direccion
        self.telefono = telefono
        self.mail = mail


class ObraSocialUpdate:
    def __init__(self,
                 nombre: Optional[str] = None,
                 cuit: Optional[str] = None,
                 direccion: Optional[str] = None,
                 telefono: Optional[str] = None,
                 mail: Optional[str] = None):
        self.nombre = nombre
        self.cuit = cuit
        self.direccion = direccion
        self.telefono = telefono
        self.mail = mail


class ObraSocialResponse(ObraSocialBase):
    def __init__(self,
                 nombre: str,
                 id_obra_social: int,
                 cuit: Optional[str] = None,
                 direccion: Optional[str] = None,
                 telefono: Optional[str] = None,
                 mail: Optional[str] = None):
        super().__init__(nombre)
        self.id_obra_social = id_obra_social
        self.cuit = cuit
        self.direccion = direccion
        self.telefono = telefono
        self.mail = mail