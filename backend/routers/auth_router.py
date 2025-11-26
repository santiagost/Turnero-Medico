import datetime
from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.encoders import jsonable_encoder
from typing import List
import sqlite3
from database import get_db
from services.auth_service import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
    responses={404: {"description": "Not found"}},
)


def get_auth_service(db: sqlite3.Connection = Depends(get_db)) -> AuthService:
    """Dependency Injection para el servicio de autenticación"""
    return AuthService(db)


@router.post("/login", response_model=dict)
async def login(data: dict, service: AuthService = Depends(get_auth_service)):
    email = data.get("email")
    password = data.get("password")
    rol = data.get("rol")

    if not email or not password or not rol:
        raise HTTPException(status_code=400, detail="Faltan campos obligatorios")

    try:
        result = service.login(email, password, rol)
        return jsonable_encoder(result)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/change-password", response_model=dict)
async def change_password(data: dict, service: AuthService = Depends(get_auth_service)):
    id_usuario = data.get("id_usuario")
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not id_usuario or not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Faltan campos obligatorios")

    try:
        result = service.change_password(id_usuario, current_password, new_password)
        return jsonable_encoder(result)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/recover-password", status_code=status.HTTP_200_OK)
async def recover_password(data: dict, service: AuthService = Depends(get_auth_service)):
    email = data.get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Falta el campo obligatorio 'email'")

    try:
        service.recover_password(email)
        return {"message": "Se ha enviado un correo con la nueva contraseña temporal."}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))