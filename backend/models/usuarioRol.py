from typing import Optional


class UsuarioRolBase:
    def __init__(self, id_usuario: int, id_rol: int):
        self.id_usuario = id_usuario
        self.id_rol = id_rol


class UsuarioRolCreate(UsuarioRolBase):
    def __init__(self, id_usuario: int, id_rol: int):
        super().__init__(id_usuario, id_rol)


class UsuarioRolResponse(UsuarioRolBase):
    def __init__(self, 
                 id_usuario: int, 
                 id_rol: int,
                 usuario = None,  # UsuarioResponse 
                 rol = None):  # RolResponse 
        super().__init__(id_usuario, id_rol)
        self.usuario = usuario
        self.rol = rol


