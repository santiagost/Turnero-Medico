

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from typing import List
import sqlite3
from database import get_db
from models.estadoturno import EstadoTurnoCreate, EstadoTurnoResponse
from services.estado_turno_service import EstadoTurnoService

router = APIRouter(
    prefix="/estados-turno",
    tags=["Estados de Turno"],
    responses={404: {"description": "Not found"}},
)

def get_estado_turno_service(db: sqlite3.Connection = Depends(get_db)) -> EstadoTurnoService:
    """Dependency Injection para el servicio de estados de turno"""
    return EstadoTurnoService(db)

@router.get("/", response_model=List[dict])
async def get_all_estados_turno(service: EstadoTurnoService = Depends(get_estado_turno_service)):
    """Obtiene todos los estados de turno"""
    estados = service.get_all()
    return jsonable_encoder(estados)

@router.get("/{estado_turno_id}", response_model=dict)
async def get_estado_turno_by_id(estado_turno_id: int, service: EstadoTurnoService = Depends(get_estado_turno_service)):
    """Obtiene un estado de turno por ID"""
    estado = service.get_by_id(estado_turno_id)
    if not estado:
        raise HTTPException(status_code=404, detail="Estado de turno no encontrado")
    return jsonable_encoder(estado)


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_estado_turno(estado_data: dict, service: EstadoTurnoService = Depends(get_estado_turno_service)):
    try:
        estado_turno = EstadoTurnoCreate(
            nombre=estado_data['nombre'],
            descripcion=estado_data['descripcion']
        )
        resultado = service.create(estado_turno)
        return jsonable_encoder(resultado)
    
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Falta el campo obligatorio: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    
@router.put("/{estado_turno_id}", response_model=dict)
async def update_estado_turno(
    estado_turno_id: int, 
    estado_data: dict, 
    service: EstadoTurnoService = Depends(get_estado_turno_service)):

    try:
        resultado = service.update(estado_turno_id, estado_data)
        if not resultado:
            raise HTTPException(status_code=404, detail="Estado de turno no encontrado")
        return jsonable_encoder(resultado)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{estado_turno_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_estado_turno(estado_turno_id: int, service: EstadoTurnoService = Depends(get_estado_turno_service)):
    """Elimina un estado de turno por ID"""
    success = service.delete(estado_turno_id)
    if not success:
        raise HTTPException(status_code=404, detail="Estado de turno no encontrado")
    return None


                              
                              