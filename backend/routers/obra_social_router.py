
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.encoders import jsonable_encoder
from typing import List
import sqlite3
from database import get_db
from models.obraSocial import ObraSocialResponse, ObraSocialCreate
from services.obra_social_service import ObraSocialService


router = APIRouter(
    prefix="/obras-sociales",
    tags=["Obras Sociales"],
    responses={404: {"description": "Not found"}},
)

def get_obra_social_service(db: sqlite3.Connection = Depends(get_db)) -> ObraSocialService:
    """Dependency Injection para el servicio de obras sociales"""
    return ObraSocialService(db)

@router.get("/", response_model=List[dict])
async def get_all_obras_sociales(service: ObraSocialService = Depends(get_obra_social_service)):
    """Obtiene todas las obras sociales"""
    obras_sociales = service.get_all()
    return jsonable_encoder(obras_sociales)


@router.get("/{obra_social_id}", response_model=dict)
async def get_obra_social_by_id(obra_social_id: int, service: ObraSocialService = Depends(get_obra_social_service)):
    """Obtiene una obra social por ID"""
    obra_social = service.get_by_id(obra_social_id)
    if not obra_social:
        raise HTTPException(status_code=404, detail="Obra Social no encontrada")
    return jsonable_encoder(obra_social)

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_obra_social(obra_social_data: dict, service: ObraSocialService = Depends(get_obra_social_service)):
    """Crea una nueva obra social"""
    try:
        obra_social = ObraSocialCreate(
            nombre=obra_social_data['nombre'],
            cuit=obra_social_data.get('cuit'),
            direccion=obra_social_data.get('direccion'),
            telefono=obra_social_data.get('telefono'),
            mail=obra_social_data.get('mail')
        )
        resultado = service.create(obra_social)
        return jsonable_encoder(resultado)
    
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Falta el campo obligatorio: {str(e)}")
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.put("/{obra_social_id}", response_model=dict)
async def update_obra_social(
    obra_social_id: int,
    obra_social_data: dict,
    service: ObraSocialService = Depends(get_obra_social_service)):

    try:
        nombre = obra_social_data.get('nombre')
        cuit = obra_social_data.get('cuit')
        direccion = obra_social_data.get('direccion')
        telefono = obra_social_data.get('telefono')
        mail = obra_social_data.get('mail')

        resultado = service.update(obra_social_id, nombre, cuit, direccion, telefono, mail)
        if not resultado:
            raise HTTPException(status_code=404, detail="Obra Social no encontrada")
        return jsonable_encoder(resultado)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{obra_social_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_obra_social(obra_social_id: int, service: ObraSocialService = Depends(get_obra_social_service)):
    """Elimina una obra social por ID"""
    try:
        eliminado_os = service.delete(obra_social_id)
        if not eliminado_os:
            raise HTTPException(status_code=404, detail="Obra Social no encontrada")
        return None
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

