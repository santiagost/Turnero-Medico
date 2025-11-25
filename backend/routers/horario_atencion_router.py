from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.encoders import jsonable_encoder
from typing import List
import sqlite3
from database import get_db
from models.horarioAtencion import HorarioAtencionResponse, HorarioAtencionCreate, HorarioAtencionUpdate
from services.horario_atencion_service import HorarioAtencionService


router = APIRouter(
    prefix="/horarios-atencion",
    tags=["Horarios de Atención"],
    responses={404: {"description": "Not found"}},
)


def get_horario_atencion_service(db: sqlite3.Connection = Depends(get_db)) -> HorarioAtencionService:
    """Dependency Injection para el servicio de horarios de atención"""
    return HorarioAtencionService(db)


@router.get("/", response_model=List[dict])
async def get_all_horarios_atencion(service: HorarioAtencionService = Depends(get_horario_atencion_service)):
    """Obtiene todos los horarios de atención"""
    horarios = service.get_all()
    return jsonable_encoder(horarios)


@router.get("/{horario_id}", response_model=dict)
async def get_horario_atencion_by_id(horario_id: int, service: HorarioAtencionService = Depends(get_horario_atencion_service)):
    """Obtiene un horario de atención por ID"""
    horario = service.get_by_id(horario_id)
    if not horario:
        raise HTTPException(status_code=404, detail="Horario de atención no encontrado")
    return jsonable_encoder(horario)

# REDUCIR LA CANTIDAD DE INFORMACION QUE DEVUELVE, YA QUE NO INTERESA TENER TODO EL DETALLE DE UN MEDICO
@router.get("/medico/{medico_id}", response_model=List[dict])
async def get_horarios_by_medico(medico_id: int, service: HorarioAtencionService = Depends(get_horario_atencion_service)):
    """Obtiene todos los horarios de atención de un médico"""
    horarios = service.get_by_medico_id(medico_id)
    return jsonable_encoder(horarios)

@router.put("/medico/{medico_id}", response_model=List[dict])
async def update_horarios_for_medico(medico_id: int, horarios_data: List[dict], service: HorarioAtencionService = Depends(get_horario_atencion_service)):
    """Actualiza los horarios de atención para un médico"""
    try:
        horarios = []
        for horario_data in horarios_data:
            horario_nuevo = HorarioAtencionCreate(
                id_medico=medico_id,
                dia_semana=horario_data['dia_semana'],
                hora_inicio=horario_data['hora_inicio'],
                hora_fin=horario_data['hora_fin'],
                duracion_turno_min=horario_data.get('duracion_turno_min', 30)
            )
            horarios.append(horario_nuevo)

        resultados = service.editar_horarios_medico(medico_id, horarios)
        
        return jsonable_encoder(resultados)
    
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Falta el campo obligatorio: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_horario_atencion(horario_data: dict, service: HorarioAtencionService = Depends(get_horario_atencion_service)):
    """Crea un nuevo horario de atención"""
    try:
        horario = HorarioAtencionCreate(
            id_medico=horario_data['id_medico'],
            dia_semana=horario_data['dia_semana'],
            hora_inicio=horario_data['hora_inicio'],
            hora_fin=horario_data['hora_fin'],
            duracion_turno_min=horario_data.get('duracion_turno_min', 30)
        )
        resultado = service.create(horario)
        return jsonable_encoder(resultado)
    
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Falta el campo obligatorio: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{horario_id}", response_model=dict)
async def update_horario_atencion(
    horario_id: int,
    horario_data: dict,
    service: HorarioAtencionService = Depends(get_horario_atencion_service)
):
    """Actualiza un horario de atención existente"""
    try:
        horario_update = HorarioAtencionUpdate(
            dia_semana=horario_data.get('dia_semana'),
            hora_inicio=horario_data.get('hora_inicio'),
            hora_fin=horario_data.get('hora_fin'),
            duracion_turno_min=horario_data.get('duracion_turno_min')
        )
        resultado = service.update(horario_id, horario_update)
        if not resultado:
            raise HTTPException(status_code=404, detail="Horario de atención no encontrado")
        return jsonable_encoder(resultado)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.delete("/{horario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_horario_atencion(horario_id: int, service: HorarioAtencionService = Depends(get_horario_atencion_service)):
    """Elimina un horario de atención"""
    try:
        success = service.delete(horario_id)
        if not success:
            raise HTTPException(status_code=404, detail="Horario de atención no encontrado")
        return None
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
