"""
Controlador de pacientes - Coordina las peticiones HTTP con el servicio
"""
from fastapi import APIRouter, Depends, status
from typing import List
import sqlite3
from database import get_db
from models.schemas import PacienteResponse, PacienteCreate, PacienteUpdate
from services.paciente_service import PacienteService


router = APIRouter(
    prefix="/pacientes",
    tags=["Pacientes"],
    responses={404: {"description": "Not found"}},
)


def get_paciente_service(db: sqlite3.Connection = Depends(get_db)) -> PacienteService:
    """Dependency Injection para el servicio de pacientes"""
    return PacienteService(db)


@router.get("/", response_model=List[PacienteResponse])
async def get_all_pacientes(service: PacienteService = Depends(get_paciente_service)):
    """Obtiene todos los pacientes"""
    return service.get_all()


@router.get("/{paciente_id}", response_model=PacienteResponse)
async def get_paciente_by_id(paciente_id: int, service: PacienteService = Depends(get_paciente_service)):
    """Obtiene un paciente por ID"""
    return service.get_by_id(paciente_id)


@router.post("/", response_model=PacienteResponse, status_code=status.HTTP_201_CREATED)
async def create_paciente(paciente: PacienteCreate, service: PacienteService = Depends(get_paciente_service)):
    """Crea un nuevo paciente"""
    return service.create(paciente.model_dump())


@router.put("/{paciente_id}", response_model=PacienteResponse)
async def update_paciente(
    paciente_id: int,
    paciente_update: PacienteUpdate,
    service: PacienteService = Depends(get_paciente_service)
):
    """Actualiza un paciente existente"""
    # Solo enviar campos no-nulos
    update_data = {k: v for k, v in paciente_update.model_dump().items() if v is not None}
    return service.update(paciente_id, update_data)


@router.delete("/{paciente_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_paciente(paciente_id: int, service: PacienteService = Depends(get_paciente_service)):
    """Elimina un paciente"""
    service.delete(paciente_id)
    return None

