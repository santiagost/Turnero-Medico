

from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.encoders import jsonable_encoder
from typing import List
import sqlite3
from database import get_db
from models.especialidad import EspecialidadResponse, EspecialidadCreate, EspecialidadUpdate
from services.especialidad_service import EspecialidadService

router = APIRouter(
    prefix="/especialidades",
    tags=["Especialidades"],
    responses={404: {"description": "Not found"}},
)

def get_especialidad_service(db: sqlite3.Connection = Depends(get_db)) -> EspecialidadService:
    """Dependency Injection para el servicio de especialidades"""
    return EspecialidadService(db)

@router.get("/", response_model=List[dict])
async def get_all_especialidades(service: EspecialidadService = Depends(get_especialidad_service)):
    """Obtiene todas las especialidades"""
    especialidades = service.get_all()
    return jsonable_encoder(especialidades)

@router.get("/{especialidad_id}", response_model=dict)
async def get_especialidad_by_id(especialidad_id: int, service: EspecialidadService = Depends(get_especialidad_service)):
    """Obtiene una especialidad por ID"""
    especialidad = service.get_by_id(especialidad_id)
    if not especialidad:
        raise HTTPException(status_code=404, detail="Especialidad no encontrada")
    return jsonable_encoder(especialidad)

# quizas sea innecesario ya que get_all ya devuelve poca info
@router.get("/ligero/", response_model=List[dict])
async def get_all_especialidades_ligero(service: EspecialidadService = Depends(get_especialidad_service)):
    """Obtiene todas las especialidades en formato ligero"""
    especialidades = service.get_ligero()
    return jsonable_encoder(especialidades)


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_especialidad(especialidad_data: dict, service: EspecialidadService = Depends(get_especialidad_service)):
    """Crea una nueva especialidad"""
    try:
        especialidad = EspecialidadCreate(
            nombre=especialidad_data['nombre'],
            descripcion=especialidad_data.get('descripcion')
        )
        resultado = service.create(especialidad)
        return jsonable_encoder(resultado)
    
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Falta el campo obligatorio: {str(e)}")
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{especialidad_id}", response_model=dict)
async def update_especialidad(
    especialidad_id: int, 
    especialidad_data: dict, 
    service: EspecialidadService = Depends(get_especialidad_service)):
    """Actualiza una especialidad existente"""
    try:
        especialidad_actualizada = service.update(especialidad_id, especialidad_data)
        if especialidad_actualizada is None:
            raise HTTPException(status_code=404, detail="Especialidad no encontrada")
        return jsonable_encoder(especialidad_actualizada)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.delete("/{especialidad_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_especialidad(especialidad_id: int, service: EspecialidadService = Depends(get_especialidad_service)):
    """Elimina una especialidad por ID"""
    try:
        eliminado_esp = service.delete(especialidad_id)
        if not eliminado_esp:
            raise HTTPException(status_code=404, detail="Especialidad no encontrada")
        return None
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))



