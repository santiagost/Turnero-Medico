from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.encoders import jsonable_encoder
from typing import List
import sqlite3
from database import get_db
from models.paciente import PacienteResponse, PacienteCreate, PacienteUpdate
from services.paciente_service import PacienteService


router = APIRouter(
    prefix="/pacientes",
    tags=["Pacientes"],
    responses={404: {"description": "Not found"}},
)


def get_paciente_service(db: sqlite3.Connection = Depends(get_db)) -> PacienteService:
    """Dependency Injection para el servicio de pacientes"""
    return PacienteService(db)


@router.get("/", response_model=List[dict])
async def get_all_pacientes(
    id_paciente: int = None,
    dni: str = None,
    nombre: str = None,
    apellido: str = None,
    id_obra_social: int = None,
    service: PacienteService = Depends(get_paciente_service)
):
    """Obtiene todos los pacientes"""
    pacientes = service.get_all(id_paciente, dni, nombre, apellido, id_obra_social)
    return jsonable_encoder(pacientes)


@router.get("/{paciente_id}", response_model=dict)
async def get_paciente_by_id(paciente_id: int, service: PacienteService = Depends(get_paciente_service)):
    """Obtiene un paciente por ID"""
    paciente = service.get_by_id(paciente_id)
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    return jsonable_encoder(paciente)

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create(usuario_data: dict, service: PacienteService = Depends(get_paciente_service)):
    """Registra un nuevo paciente junto con su usuario"""
    try:
        resultado = service.create(usuario_data)
        return jsonable_encoder(resultado)
    
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Falta el campo obligatorio: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{paciente_id}", response_model=dict)
async def update_paciente(
    paciente_id: int,
    paciente_data: dict,
    service: PacienteService = Depends(get_paciente_service)
):
    """Actualiza un paciente existente"""
    try:
        paciente_update = PacienteUpdate(
            nombre=paciente_data.get('nombre'),
            apellido=paciente_data.get('apellido'),
            fecha_nacimiento=paciente_data.get('fecha_nacimiento'),
            telefono=paciente_data.get('telefono'),
            id_obra_social=paciente_data.get('id_obra_social'),
            nro_afiliado=paciente_data.get('nro_afiliado'),
            noti_reserva_email_act=paciente_data.get('noti_reserva_email_act')
        )
        resultado = service.update(paciente_id, paciente_update)
        if not resultado:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        return jsonable_encoder(resultado)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.delete("/{paciente_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_paciente(paciente_id: int, service: PacienteService = Depends(get_paciente_service)):
    """Elimina un paciente"""
    try:
        success = service.delete(paciente_id)
        if not success:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        return None
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
