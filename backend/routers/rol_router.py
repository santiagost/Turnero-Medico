
from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from typing import List
import sqlite3
from database import get_db
from models.rol import RolResponse, RolCreate, RolUpdate
from services.rol_service import RolService


router = APIRouter(
    prefix="/roles",
    tags=["Roles"],
    responses={404: {"description": "Not found"}},
)

def get_rol_service(db: sqlite3.Connection = Depends(get_db)) -> RolService:
    """Dependency Injection para el servicio de roles"""
    return RolService(db)


@router.get("/", response_model=List[dict])
async def get_all_roles(service: RolService = Depends(get_rol_service)):
    """Obtiene todos los roles"""
    roles = service.get_all()
    return jsonable_encoder(roles)

@router.get("/{rol_id}", response_model=dict)
async def get_rol_by_id(rol_id: int, service: RolService = Depends(get_rol_service)):
    """Obtiene un rol por ID"""
    rol = service.get_by_id(rol_id)
    if not rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return jsonable_encoder(rol)

@router.post("/", response_model=dict, status_code=201)
async def create_rol(rol_data: dict, service: RolService = Depends(get_rol_service)):
    try:
        
        rol = RolCreate(
            nombre=rol_data['nombre'],
            descripcion=rol_data.get('descripcion')
        )

        resultado = service.create(rol)
        return jsonable_encoder(resultado)
    except ValueError as e:
        # Si hay error (ej: nombre duplicado), lanzamos un 400 Bad Request
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{rol_id}", response_model=dict)
async def update_rol(
    rol_id: int,
    rol_data: dict,
    service: RolService = Depends(get_rol_service)
):
    """Actualiza un rol existente"""
    existing_rol = service.get_by_id(rol_id)
    if not existing_rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")

    rol_update = RolUpdate(
        nombre=rol_data.get('nombre', existing_rol.nombre),
        descripcion=rol_data.get('descripcion', existing_rol.descripcion)
    )

    try:
        updated_rol = service.update(rol_id, rol_update)
        return jsonable_encoder(updated_rol)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{rol_id}", status_code=204)
async def delete_rol(rol_id: int, service: RolService = Depends(get_rol_service)):
    """Elimina un rol existente"""
    try:
        success = service.delete(rol_id)
        if not success:
            raise HTTPException(status_code=404, detail="Rol no encontrado")
        return None
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

