from typing import Optional


class MedicoBase:
    def __init__(self,
                 matricula: str,
                 dni: str,
                 nombre: str,
                 apellido: str):
        self.matricula = matricula
        self.dni = dni
        self.nombre = nombre
        self.apellido = apellido


class MedicoCreate(MedicoBase):
    def __init__(self,
                 matricula: str,
                 dni: str,
                 nombre: str,
                 apellido: str,
                 id_usuario: int,
                 id_especialidad: int,
                 telefono: Optional[str] = None):
        super().__init__(matricula, dni, nombre, apellido)
        self.id_usuario = id_usuario
        self.id_especialidad = id_especialidad
        self.telefono = telefono


class MedicoUpdate:
    def __init__(self,
                 nombre: Optional[str] = None,
                 apellido: Optional[str] = None,
                 telefono: Optional[str] = None,
                 id_especialidad: Optional[int] = None):
        self.nombre = nombre
        self.apellido = apellido
        self.telefono = telefono
        self.id_especialidad = id_especialidad


class MedicoResponse(MedicoBase):
    def __init__(self,
                 matricula: str,
                 dni: str,
                 nombre: str,
                 apellido: str,
                 id_medico: int,
                 id_usuario: int,
                 id_especialidad: int,
                 telefono: Optional[str] = None,
                 usuario = None,  # UsuarioResponse 
                 especialidad = None):  # EspecialidadResponse 
        super().__init__(matricula, dni, nombre, apellido)
        self.id_medico = id_medico
        self.id_usuario = id_usuario
        self.id_especialidad = id_especialidad
        self.telefono = telefono
        self.usuario = usuario
        self.especialidad = especialidad