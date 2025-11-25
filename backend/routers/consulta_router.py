import datetime
from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.encoders import jsonable_encoder
from typing import List
import sqlite3
from database import get_db
from models.consulta import ConsultaResponse, ConsultaCreate, ConsultaUpdate
from services.consulta_service import ConsultaService
from services.turno_service import TurnoService


router = APIRouter(
    prefix="/consultas",
    tags=["Consultas"],
    responses={404: {"description": "Not found"}},
)


def get_consulta_service(db: sqlite3.Connection = Depends(get_db)) -> ConsultaService:
    """Dependency Injection para el servicio de consultas"""
    return ConsultaService(db)


@router.get("/", response_model=List[dict])
async def get_all_consultas(service: ConsultaService = Depends(get_consulta_service)):
    """Obtiene todas las consultas"""
    consultas = service.get_all()
    return jsonable_encoder(consultas)


@router.get("/{consulta_id}", response_model=dict)
async def get_consulta_by_id(consulta_id: int, service: ConsultaService = Depends(get_consulta_service)):
    """Obtiene una consulta por ID"""
    consulta = service.get_by_id(consulta_id)
    if not consulta:
        raise HTTPException(status_code=404, detail="Consulta no encontrada")
    return jsonable_encoder(consulta)


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_consulta(consulta_data: dict, service: ConsultaService = Depends(get_consulta_service)):
    """Crea una nueva consulta"""
    try:
        consulta = ConsultaCreate(
            id_turno=consulta_data['id_turno'],
            fecha_consulta=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            diagnostico=consulta_data.get('diagnostico'),
            notas_privadas_medico=consulta_data.get('notas_privadas_medico'),
            tratamiento=consulta_data.get('tratamiento')
        )

        TurnoService(service.db).marcar_como_atendido(consulta.id_turno)
        resultado = service.create(consulta)

        return jsonable_encoder(resultado)
    
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Falta el campo obligatorio: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{consulta_id}", response_model=dict)
async def update_consulta(
    consulta_id: int,
    consulta_data: dict,
    service: ConsultaService = Depends(get_consulta_service)
):
    """Actualiza una consulta existente"""
    try:
        consulta_update = ConsultaUpdate(
            diagnostico=consulta_data.get('diagnostico'),
            notas_privadas_medico=consulta_data.get('notas_privadas_medico'),
            tratamiento=consulta_data.get('tratamiento')
        )
        resultado = service.update(consulta_id, consulta_update)
        if not resultado:
            raise HTTPException(status_code=404, detail="Consulta no encontrada")
        return jsonable_encoder(resultado)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.delete("/{consulta_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_consulta(consulta_id: int, service: ConsultaService = Depends(get_consulta_service)):
    """Elimina una consulta"""
    try:
        success = service.delete(consulta_id)
        if not success:
            raise HTTPException(status_code=404, detail="Consulta no encontrada")
        return None
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
