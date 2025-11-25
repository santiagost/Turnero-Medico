from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.encoders import jsonable_encoder
from typing import List, Optional
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
async def get_all_medicos(
    dni: Optional[str] = None,
    matricula: Optional[str] = None,
    nombre: Optional[str] = None,
    apellido: Optional[str] = None,
    id_medico: Optional[int] = None,
    id_usuario: Optional[int] = None,
    id_especialidad: Optional[int] = None,
    telefono: Optional[str] = None,
    service: MedicoService = Depends(get_medico_service)):
    """Obtiene todos los medicos"""
    medicos = service.get_all(
        matricula=matricula,
        id_especialidad=id_especialidad,
        dni=dni,
        nombre=nombre,
        apellido=apellido,
        id_medico=id_medico,
        id_usuario=id_usuario,
        telefono=telefono
    )
    return jsonable_encoder(medicos)


@router.get("/{medico_id}", response_model=dict)
async def get_medico_by_id(medico_id: int, service: MedicoService = Depends(get_medico_service)):
    """Obtiene un medico por ID"""
    medico = service.get_by_id(medico_id)
    if not medico:
        raise HTTPException(status_code=404, detail="Médico no encontrado")
    return jsonable_encoder(medico)

@router.get("/ligero/", response_model=List[dict])
async def get_all_medicos_ligero(service: MedicoService = Depends(get_medico_service)):
    """Obtiene todos los medicos en formato ligero"""
    medicos = service.get_ligero()
    return jsonable_encoder(medicos)


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_medico(medico_data: dict, service: MedicoService = Depends(get_medico_service)):
    """Crea un nuevo medico"""
    try:
        medico = MedicoCreate(
            dni=medico_data['dni'],
            nombre=medico_data['nombre'],
            apellido=medico_data['apellido'],
            matricula=medico_data['matricula'],
            telefono=medico_data.get('telefono'),
            id_usuario=medico_data['id_usuario'],
            id_especialidad=medico_data['id_especialidad'],
            noti_cancel_email_act=medico_data.get('noti_cancel_email_act', 1)
        )
        resultado = service.create(medico)
        return jsonable_encoder(resultado)
    
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Falta el campo obligatorio: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{medico_id}", response_model=dict)
async def update_medico(
    medico_id: int,
    medico_data: dict,
    service: MedicoService = Depends(get_medico_service)
):
    """Actualiza un medico existente"""
    try:
        medico_update = MedicoUpdate(
            nombre=medico_data.get('nombre'),
            apellido=medico_data.get('apellido'),
            telefono=medico_data.get('telefono'),
            id_especialidad=medico_data.get('id_especialidad')
        )
        resultado = service.update(medico_id, medico_update)
        if not resultado:
            raise HTTPException(status_code=404, detail="Médico no encontrado")
        return jsonable_encoder(resultado)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{medico_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medico(medico_id: int, service: MedicoService = Depends(get_medico_service)):
    """Elimina un medico"""
    try:
        success = service.delete(medico_id)
        if not success:
            raise HTTPException(status_code=404, detail="Médico no encontrado")
        return None
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))