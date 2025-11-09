"""
Modelos Pydantic para la validación de datos.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ============================================
# Modelos de Usuario
# ============================================
class UsuarioBase(BaseModel):
    email: EmailStr
    activo: bool = True


class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=6)


class UsuarioResponse(UsuarioBase):
    id_usuario: int
    creado_en: str
    
    class Config:
        from_attributes = True

# ============================================
# Modelos de Obra Social
# ============================================
class ObraSocialBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=200)
    cuit: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    mail: Optional[EmailStr] = None


class ObraSocialCreate(ObraSocialBase):
    pass

class ObraSocialResponse(ObraSocialBase):
    id_obra_social: int
    
    class Config:
        from_attributes = True


# ============================================
# Modelos de Paciente
# ============================================
class PacienteBase(BaseModel):
    dni: str = Field(..., min_length=7, max_length=10)
    nombre: str = Field(..., min_length=2, max_length=100)
    apellido: str = Field(..., min_length=2, max_length=100)
    telefono: str = Field(..., min_length=8, max_length=15)
    fecha_nacimiento: Optional[str] = None


class PacienteCreate(PacienteBase):
    id_obra_social: Optional[int] = None
    nro_afiliado: Optional[str] = None


class PacienteUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    fecha_nacimiento: Optional[str] = None
    telefono: Optional[str] = None
    id_obra_social: Optional[int] = None
    nro_afiliado: Optional[str] = None


class PacienteResponse(PacienteBase):
    id_paciente: int
    nro_afiliado: Optional[str] = None
    usuario: Optional[UsuarioResponse] = None
    obra_social: Optional[ObraSocialResponse] = None
    
    class Config:
        from_attributes = True


# ============================================
# Modelos de Médico
# ============================================
class MedicoBase(BaseModel):
    matricula: str = Field(..., min_length=4, max_length=20)
    dni: str = Field(..., min_length=7, max_length=10)
    nombre: str = Field(..., min_length=2, max_length=100)
    apellido: str = Field(..., min_length=2, max_length=100)
    telefono: Optional[str] = None


class MedicoCreate(MedicoBase):
    id_especialidad: int
    id_usuario: int


class MedicoResponse(MedicoBase):
    id_medico: int
    id_usuario: int
    id_especialidad: int
    
    class Config:
        from_attributes = True


# ============================================
# Modelos de Turno
# ============================================
class TurnoBase(BaseModel):
    fecha_hora_inicio: str
    fecha_hora_fin: str
    motivo_consulta: Optional[str] = None


class TurnoCreate(TurnoBase):
    id_paciente: int
    id_medico: int


class TurnoUpdate(BaseModel):
    id_estado_turno: Optional[int] = None
    motivo_consulta: Optional[str] = None


class TurnoResponse(TurnoBase):
    id_turno: int
    id_paciente: int
    id_medico: int
    id_estado_turno: int
    
    class Config:
        from_attributes = True



# ============================================
# Modelos de Especialidad
# ============================================
class EspecialidadBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    descripcion: Optional[str] = None


class EspecialidadCreate(EspecialidadBase):
    pass


class EspecialidadResponse(EspecialidadBase):
    id_especialidad: int
    
    class Config:
        from_attributes = True
