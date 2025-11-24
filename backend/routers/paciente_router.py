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
async def get_all_pacientes(service: PacienteService = Depends(get_paciente_service)):
    """Obtiene todos los pacientes"""
    pacientes = service.get_all()
    return jsonable_encoder(pacientes)


@router.get("/{paciente_id}", response_model=dict)
async def get_paciente_by_id(paciente_id: int, service: PacienteService = Depends(get_paciente_service)):
    """Obtiene un paciente por ID"""
    paciente = service.get_by_id(paciente_id)
    return jsonable_encoder(paciente)


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_paciente(paciente_data: dict, service: PacienteService = Depends(get_paciente_service)):
    """Crea un nuevo paciente"""
    # Crear objeto PacienteCreate desde el dict
    try:
        paciente = PacienteCreate(
            dni=paciente_data['dni'],
            nombre=paciente_data['nombre'],
            apellido=paciente_data['apellido'],
            telefono=paciente_data['telefono'],
            id_usuario=paciente_data.get('id_usuario'),
            fecha_nacimiento=paciente_data.get('fecha_nacimiento'),
            id_obra_social=paciente_data.get('id_obra_social'),
            nro_afiliado=paciente_data.get('nro_afiliado')
        )
        resultado = service.create(paciente)
        return jsonable_encoder(resultado)
    except ValueError as e:
        # Si hay error (ej: dni duplicado), lanzamos un 400 Bad Request
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{paciente_id}", response_model=dict)
async def update_paciente(
    paciente_id: int,
    paciente_data: dict,
    service: PacienteService = Depends(get_paciente_service)
):
    try:
        """Actualiza un paciente existente"""
        # Crear objeto PacienteUpdate desde el dict
        paciente_update = PacienteUpdate(
            nombre=paciente_data.get('nombre'),
            apellido=paciente_data.get('apellido'),
            fecha_nacimiento=paciente_data.get('fecha_nacimiento'),
            telefono=paciente_data.get('telefono'),
            id_obra_social=paciente_data.get('id_obra_social'),
            nro_afiliado=paciente_data.get('nro_afiliado')
        )
        resultado = service.update(paciente_id, paciente_update)
        return jsonable_encoder(resultado)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.delete("/{paciente_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_paciente(paciente_id: int, service: PacienteService = Depends(get_paciente_service)):
    """Elimina un paciente"""
    service.delete(paciente_id)
    return None

