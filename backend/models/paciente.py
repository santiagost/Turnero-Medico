from typing import Optional


class PacienteBase:
    def __init__(self, 
                 dni: str, 
                 nombre: str, 
                 apellido: str,
                 telefono: str):
        self.dni = dni
        self.nombre = nombre
        self.apellido = apellido
        self.telefono = telefono


class PacienteCreate(PacienteBase):
    def __init__(self, 
                 dni: str, 
                 nombre: str, 
                 apellido: str,
                 telefono: str,
                 id_usuario: Optional[int] = None,
                 fecha_nacimiento: Optional[str] = None,
                 id_obra_social: Optional[int] = None,
                 nro_afiliado: Optional[str] = None):
        super().__init__(dni, nombre, apellido, telefono)
        self.id_usuario = id_usuario
        self.fecha_nacimiento = fecha_nacimiento
        self.id_obra_social = id_obra_social
        self.nro_afiliado = nro_afiliado


class PacienteUpdate:
    def __init__(self,
                 nombre: Optional[str] = None,
                 apellido: Optional[str] = None,
                 fecha_nacimiento: Optional[str] = None,
                 telefono: Optional[str] = None,
                 id_obra_social: Optional[int] = None,
                 id_usuario: Optional[int] = None,
                 nro_afiliado: Optional[str] = None,
                 noti_reserva_email_act: Optional[bool] = None):
        self.nombre = nombre
        self.apellido = apellido
        self.fecha_nacimiento = fecha_nacimiento
        self.telefono = telefono
        self.id_obra_social = id_obra_social
        self.id_usuario = id_usuario
        self.nro_afiliado = nro_afiliado
        self.noti_reserva_email_act = noti_reserva_email_act


class PacienteResponse(PacienteBase):
    def __init__(self,
                 dni: str,
                 nombre: str,
                 apellido: str,
                 telefono: str,
                 id_paciente: int,
                 id_usuario: Optional[int] = None,
                 fecha_nacimiento: Optional[str] = None,
                 id_obra_social: Optional[int] = None,
                 nro_afiliado: Optional[str] = None,
                 usuario = None,  # UsuarioResponse 
                 obra_social = None,  # ObraSocialResponse 
                 noti_reserva_email_act: Optional[bool] = None):
        super().__init__(dni, nombre, apellido, telefono)
        self.id_paciente = id_paciente
        self.id_usuario = id_usuario
        self.fecha_nacimiento = fecha_nacimiento
        self.id_obra_social = id_obra_social
        self.nro_afiliado = nro_afiliado
        self.usuario = usuario
        self.obra_social = obra_social
        self.noti_reserva_email_act = noti_reserva_email_act