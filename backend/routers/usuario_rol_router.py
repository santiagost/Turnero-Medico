from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.encoders import jsonable_encoder
from typing import List
import sqlite3
from database import get_db
from models.usuarioRol import UsuarioRolResponse, UsuarioRolCreate
from services.usuario_rol_service import UsuarioRolService


router = APIRouter(
    prefix="/usuario-roles",
    tags=["Usuario-Roles"],
    responses={404: {"description": "Not found"}},
)


def get_usuario_rol_service(db: sqlite3.Connection = Depends(get_db)) -> UsuarioRolService:
    """Dependency Injection para el servicio de usuario-roles"""
    return UsuarioRolService(db)


@router.get("/", response_model=List[dict])
async def get_all_usuario_roles(service: UsuarioRolService = Depends(get_usuario_rol_service)):
    """Obtiene todas las relaciones usuario-rol"""
    usuario_roles = service.get_all()
    return jsonable_encoder(usuario_roles)


@router.get("/usuario/{usuario_id}", response_model=List[dict])
async def get_roles_by_usuario(usuario_id: int, service: UsuarioRolService = Depends(get_usuario_rol_service)):
    """Obtiene todos los roles de un usuario"""
    roles = service.get_by_usuario_id(usuario_id)
    return jsonable_encoder(roles)


@router.get("/rol/{rol_id}", response_model=List[dict])
async def get_usuarios_by_rol(rol_id: int, service: UsuarioRolService = Depends(get_usuario_rol_service)):
    """Obtiene todos los usuarios con un rol específico"""
    usuarios = service.get_by_rol_id(rol_id)
    return jsonable_encoder(usuarios)


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_usuario_rol(usuario_rol_data: dict, service: UsuarioRolService = Depends(get_usuario_rol_service)):
    """Crea una nueva relación usuario-rol"""
    try:
        usuario_rol = UsuarioRolCreate(
            id_usuario=usuario_rol_data['id_usuario'],
            id_rol=usuario_rol_data['id_rol']
        )
        resultado = service.create(usuario_rol)
        return jsonable_encoder(resultado)
    
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Falta el campo obligatorio: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{usuario_id}/{rol_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_usuario_rol(usuario_id: int, rol_id: int, service: UsuarioRolService = Depends(get_usuario_rol_service)):
    """Elimina una relación usuario-rol"""
    try:
        success = service.delete(usuario_id, rol_id)
        if not success:
            raise HTTPException(status_code=404, detail="Relación usuario-rol no encontrada")
        return None
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
