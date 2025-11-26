from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from typing import List
import sqlite3
from database import get_db
from models.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse
from services.usuario_service import UsuarioService

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"],
    responses={404: {"description": "Not found"}},
)

def get_usuario_service(db: sqlite3.Connection = Depends(get_db)) -> UsuarioService:
    """Dependency Injection para el servicio de usuarios"""
    return UsuarioService(db)

@router.get("/", response_model=List[dict])
async def get_all_usuarios(service: UsuarioService = Depends(get_usuario_service)):
    """Obtiene todos los usuarios"""
    usuarios = service.get_all()
    return jsonable_encoder(usuarios)


@router.get("/{usuario_id}", response_model=dict)
async def get_usuario_by_id(usuario_id: int, service: UsuarioService = Depends(get_usuario_service)):
    """Obtiene un usuario por ID"""
    usuario = service.get_by_id(usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return jsonable_encoder(usuario)


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_usuario(usuario_data: dict, service: UsuarioService = Depends(get_usuario_service)):
    try:
        resultado = service.create(usuario_data)
        return jsonable_encoder(resultado)
    
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Falta el campo obligatorio: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    
@router.put("/{usuario_id}", response_model=dict)
async def update_usuario(
    usuario_id: int, 
    usuario_data: dict, 
    service: UsuarioService = Depends(get_usuario_service)):

    try:
        resultado = service.update(usuario_id, usuario_data)
        if not resultado:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return jsonable_encoder(resultado)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_usuario(usuario_id: int, service: UsuarioService = Depends(get_usuario_service)):
    """Elimina un usuario por ID"""
    try:
        success = service.delete(usuario_id)
        if not success:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return None
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/perfil/{id_usuario}", response_model=dict)
async def update_perfil_usuario(
    id_usuario: int,
    usuario_update: dict,
    service: UsuarioService = Depends(get_usuario_service)
):
    """Actualiza el perfil del usuario según su rol"""
    try:
        resultado = service.editar_perfil(id_usuario, usuario_update)
        return jsonable_encoder(resultado)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))