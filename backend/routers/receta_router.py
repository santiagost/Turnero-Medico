from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import Response
from typing import List
import sqlite3
from database import get_db
from models.receta import RecetaResponse, RecetaCreate, RecetaUpdate
from services.receta_service import RecetaService


router = APIRouter(
    prefix="/recetas",
    tags=["Recetas"],
    responses={404: {"description": "Not found"}},
)


def get_receta_service(db: sqlite3.Connection = Depends(get_db)) -> RecetaService:
    """Dependency Injection para el servicio de recetas"""
    return RecetaService(db)


@router.get("/", response_model=List[dict])
async def get_all_recetas(service: RecetaService = Depends(get_receta_service)):
    """Obtiene todas las recetas"""
    recetas = service.get_all()
    return jsonable_encoder(recetas)


@router.get("/{receta_id}", response_model=dict)
async def get_receta_by_id(receta_id: int, service: RecetaService = Depends(get_receta_service)):
    """Obtiene una receta por ID"""
    receta = service.get_by_id(receta_id)
    if not receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    return jsonable_encoder(receta)


@router.get("/pdf/{consulta_id}")
async def get_recetas_pdf_by_consulta(
    consulta_id: int, 
    service: RecetaService = Depends(get_receta_service)
):
    """
    Descarga el PDF de recetas para una consulta.
    """
    try:
        # Obtenemos los bytes del PDF
        pdf_bytes = service.generar_pdf_recetas_by_consulta(consulta_id)
        
        # Configuramos para descarga
        headers = {
            "Content-Disposition": f"attachment; filename=recetas_consulta_{consulta_id}.pdf"
        }

        # Retornamos el archivo directo
        return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando PDF: {str(e)}")


@router.get("/consulta/{consulta_id}", response_model=List[dict])
async def get_recetas_by_consulta(consulta_id: int, service: RecetaService = Depends(get_receta_service)):
    """Obtiene todas las recetas de una consulta"""
    recetas = service.get_by_consulta_id(consulta_id)
    return jsonable_encoder(recetas)


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_receta(receta_data: dict, service: RecetaService = Depends(get_receta_service)):
    """Crea una nueva receta"""
    try:
        receta = RecetaCreate(
            id_consulta=receta_data['id_consulta'],
            medicamento=receta_data['medicamento'],
            fecha_emision=receta_data['fecha_emision'],
            dosis=receta_data.get('dosis'),
            instrucciones=receta_data.get('instrucciones')
        )
        resultado = service.create(receta)
        return jsonable_encoder(resultado)
    
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Falta el campo obligatorio: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{receta_id}", response_model=dict)
async def update_receta(
    receta_id: int,
    receta_data: dict,
    service: RecetaService = Depends(get_receta_service)
):
    """Actualiza una receta existente"""
    try:
        receta_update = RecetaUpdate(
            medicamento=receta_data.get('medicamento'),
            dosis=receta_data.get('dosis'),
            instrucciones=receta_data.get('instrucciones')
        )
        resultado = service.update(receta_id, receta_update)
        if not resultado:
            raise HTTPException(status_code=404, detail="Receta no encontrada")
        return jsonable_encoder(resultado)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.delete("/{receta_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_receta(receta_id: int, service: RecetaService = Depends(get_receta_service)):
    """Elimina una receta"""
    try:
        success = service.delete(receta_id)
        if not success:
            raise HTTPException(status_code=404, detail="Receta no encontrada")
        return None
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
