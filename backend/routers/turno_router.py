
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from typing import List
import sqlite3
from database import get_db
from models.turno import TurnoCreate
from services.turno_service import TurnoService

router = APIRouter(
    prefix="/turnos",
    tags=["Turnos"],
    responses={404: {"description": "Not found"}},
)

def get_turno_service(db: sqlite3.Connection = Depends(get_db)) -> TurnoService:
    """Dependency Injection para el servicio de turnos"""
    return TurnoService(db)

@router.get("/", response_model=List[dict])
async def get_all_turnos(service: TurnoService = Depends(get_turno_service)):
    """Obtiene todos los turnos"""
    turnos = service.get_all()
    return jsonable_encoder(turnos)


@router.get("/prueba_notificaciones", status_code=status.HTTP_200_OK)
async def notificar_recordatorios(service: TurnoService = Depends(get_turno_service)):
    turnos_notificados = service.notificar_recordatorios_turnos()
    return {"mensaje": "Recordatorios de turnos notificados", "turnos": jsonable_encoder(turnos_notificados)}

@router.get("/{turno_id}", response_model=dict)
async def get_turno_by_id(turno_id: int, service: TurnoService = Depends(get_turno_service)):
    """Obtiene un turno por ID"""
    turno = service.get_by_id(turno_id)
    if not turno:
        raise HTTPException(status_code=404, detail="Turno no encontrado")
    return jsonable_encoder(turno)
    

@router.get("/paciente/proximos/{paciente_id}", response_model=List[dict])
async def get_proximos_turnos_paciente(paciente_id: int, service: TurnoService = Depends(get_turno_service)):
    """Obtiene los próximos turnos de un paciente"""
    turnos = service.get_proximos_turnos_paciente(paciente_id)
    return jsonable_encoder(turnos)


# listado de todos los turnos de un determinado paciente dados entre 2 fechas desde hasta
@router.get("/paciente/historial", response_model=List[dict])
async def get_historial_turnos_paciente(
    paciente_id: int,
    fecha_desde: str,
    fecha_hasta: str,
    service: TurnoService = Depends(get_turno_service)
):
    """Obtiene el historial de turnos de un paciente entre dos fechas"""
    turnos = service.get_historial_desde_hasta(paciente_id, fecha_desde, fecha_hasta)
    return jsonable_encoder(turnos)

# listado de todos los turnos de un determinado medico dados entre 2 fechas desde hasta
@router.get("/medico/agenda", response_model=List[dict])
async def get_agenda_medico(
    id_medico: int,
    fecha_desde: str,
    fecha_hasta: str,
    service: TurnoService = Depends(get_turno_service)
):
    """Obtiene la agenda de un médico entre dos fechas"""
    turnos = service.get_agenda_desde_hasta(id_medico, fecha_desde, fecha_hasta)
    return jsonable_encoder(turnos)

@router.post("/cancelar", response_model=List[dict])
async def cancelar_turnos_paciente(
    id_paciente: int,
    id_turno: int,
    service: TurnoService = Depends(get_turno_service)
):
    """Cancela todos los turnos futuros de un paciente a partir de una fecha y hora dada"""
    turnos_cancelados = service.cancelar_turno_futuro_paciente(id_paciente, id_turno)
    return jsonable_encoder(turnos_cancelados)


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_turno(turno_data: dict, service: TurnoService = Depends(get_turno_service)):
    try:
        turno = TurnoCreate(
            id_paciente=turno_data['id_paciente'],
            id_medico=turno_data['id_medico'],
            fecha_hora_inicio=turno_data['fecha_hora_inicio'],
            fecha_hora_fin=turno_data['fecha_hora_fin'],
            id_estado_turno=turno_data.get('id_estado_turno', 1),
            motivo_consulta=turno_data.get('motivo_consulta')
        )
        resultado = service.create(turno)
        return jsonable_encoder(resultado)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Falta el campo obligatorio: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.put("/{turno_id}", response_model=dict)
async def update_turno(
    turno_id: int, 
    turno_data: dict, 
    service: TurnoService = Depends(get_turno_service)):

    try:
        resultado = service.update(turno_id, turno_data)
        if not resultado:
            raise HTTPException(status_code=404, detail="Turno no encontrado")
        return jsonable_encoder(resultado)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.delete("/{turno_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_turno(turno_id: int, service: TurnoService = Depends(get_turno_service)):
    """Elimina un turno"""
    try:
        resultado = service.delete(turno_id)
        if not resultado:
            raise HTTPException(status_code=404, detail="Turno no encontrado")
        return None
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

