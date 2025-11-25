from typing import Optional
import datetime

class Usuario:
    def __init__(self, email: str):
        self.email = email


class UsuarioCreate(Usuario):
    def __init__(self, email: str, password: str, activo: bool = True, recordatorios_activados: bool = True):
        super().__init__(email)
        self.password = password
        self.activo = activo
        self.recordatorios_activados = recordatorios_activados
        
class UsuarioLogin:
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password


class UsuarioUpdate:
    def __init__(self, 
                 email: Optional[str] = None,
                 activo: Optional[bool] = None,
                 recordatorios_activados: Optional[bool] = None):
        self.email = email
        self.activo = activo
        self.recordatorios_activados = recordatorios_activados

class UsuarioResponse(Usuario):
    def __init__(self, 
                 email: str, 
                 id_usuario: int,
                 activo: bool,
                 recordatorios_activados: bool):
        super().__init__(email)
        self.id_usuario = id_usuario
        self.activo = activo
        self.recordatorios_activados = recordatorios_activados
        
