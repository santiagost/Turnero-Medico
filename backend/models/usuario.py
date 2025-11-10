from typing import Optional

class Usuario:
    def __init__(self, email: str):
        self.email = email


class UsuarioCreate(Usuario):
    def __init__(self, email: str, password: str, activo: bool = True):
        super().__init__(email)
        self.password = password
        self.activo = activo

class UsuarioLogin:
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password


class UsuarioUpdate:
    def __init__(self, 
                 email: Optional[str] = None,
                 activo: Optional[bool] = None):
        self.email = email
        self.activo = activo

class UsuarioResponse(Usuario):
    def __init__(self, 
                 email: str, 
                 id_usuario: int,
                 activo: bool,
                 creado_en: str):
        super().__init__(email)
        self.id_usuario = id_usuario
        self.activo = activo
        self.creado_en = creado_en 