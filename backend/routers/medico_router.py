from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder
from typing import List
import sqlite3
from database import get_db
from models.medico import MedicoResponse, MedicoCreate, MedicoUpdate
from services.medico_service import MedicoService


router = APIRouter(
    prefix="/medicos",
    tags=["Medicos"],
    responses={404: {"description": "Not found"}},
)

def get_medico_service(db: sqlite3.Connection = Depends(get_db)) -> MedicoService:
    """Dependency Injection para el servicio de medicos"""
    return MedicoService(db)


@router.get("/", response_model=List[dict])
async def get_all_medicos(service: MedicoService = Depends(get_medico_service)):
    """Obtiene todos los medicos"""
    medicos = service.get_all()
    return jsonable_encoder(medicos)


@router.get("/{medico_id}", response_model=dict)
async def get_medico_by_id(medico_id: int, service: MedicoService = Depends(get_medico_service)):
    """Obtiene un medico por ID"""
    medico = service.get_by_id(medico_id)
    return jsonable_encoder(medico)


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_medico(medico_data: dict, service: MedicoService = Depends(get_medico_service)):
    """Crea un nuevo medico"""
    # Crear objeto MedicoCreate desde el dict
    medico = MedicoCreate(
        dni=medico_data['dni'],
        nombre=medico_data['nombre'],
        apellido=medico_data['apellido'],
        telefono=medico_data['telefono'],
        id_usuario=medico_data.get('id_usuario'),
        matricula=medico_data['matricula'],
        id_especialidad=medico_data.get('id_especialidad')
    )
    resultado = service.create(medico)
    return jsonable_encoder(resultado)


@router.put("/{medico_id}", response_model=dict)
async def update_medico(
    medico_id: int,
    medico_data: dict,
    service: MedicoService = Depends(get_medico_service)
):
    """Actualiza un medico existente"""
    # Crear objeto MedicoUpdate desde el dict
    medico_update = MedicoUpdate(
        nombre=medico_data.get('nombre'),
        apellido=medico_data.get('apellido'),
        telefono=medico_data.get('telefono'),
        id_especialidad=medico_data.get('id_especialidad')
    )
    resultado = service.update(medico_id, medico_update)
    return jsonable_encoder(resultado)


@router.delete("/{medico_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medico(medico_id: int, service: MedicoService = Depends(get_medico_service)):
    """Elimina un medico"""
    service.delete(medico_id)
    return None