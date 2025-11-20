
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


