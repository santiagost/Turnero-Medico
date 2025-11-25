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
                 telefono: Optional[str] = None,
                 noti_cancel_email_act: int = 1): # Por defecto activado (1)
        
        super().__init__(matricula, dni, nombre, apellido)
        self.id_usuario = id_usuario
        self.id_especialidad = id_especialidad
        self.telefono = telefono
        self.noti_cancel_email_act = noti_cancel_email_act

class MedicoUpdate:
    def __init__(self,
                 nombre: Optional[str] = None,
                 apellido: Optional[str] = None,
                 telefono: Optional[str] = None,
                 id_especialidad: Optional[int] = None,
                 noti_cancel_email_act: Optional[int] = None): # Opcional para actualizar
        
        self.nombre = nombre
        self.apellido = apellido
        self.telefono = telefono
        self.id_especialidad = id_especialidad
        self.noti_cancel_email_act = noti_cancel_email_act


class MedicoResponse(MedicoBase):
    def __init__(self,
                 id_medico: int,
                 id_usuario: int,
                 id_especialidad: int,
                 matricula: str,
                 dni: str,
                 nombre: str,
                 apellido: str,
                 telefono: Optional[str] = None,
                 noti_cancel_email_act: int = 0,
                 usuario = None,   # Objeto UsuarioResponse completo
                 especialidad = None): # Objeto EspecialidadResponse completo
        
        super().__init__(matricula, dni, nombre, apellido)
        self.id_medico = id_medico
        self.id_usuario = id_usuario
        self.id_especialidad = id_especialidad
        self.telefono = telefono
        self.noti_cancel_email_act = noti_cancel_email_act
        
        # Objetos anidados
        self.usuario = usuario
        self.especialidad = especialidad