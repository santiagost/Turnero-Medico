# aca se determinan los endpoints para devolver estadisticas y reportes del sistema
# AnalyticsRouter

# GET /estadisticas/diarias - Resumen del día (Totales hoy). Devuelve Turnos totales, pacientes atendidos, cancelados, nuevos registros. hasta ese momento en ese dia
# GET /estadisticas/especialidad - Turnos por especialidad.
# GET /estadisticas/rendimiento-medico - Listado de turnos por doctor.
# GET /estadisticas/rendimiento-medico/pdf - Descarga de reporte PDF.
# GET /estadisticas/volumen-pacientes - Evolución de pacientes en el tiempo.
# GET /estadisticas/asistencia - Comparativa Asistencias vs. Inasistencias.


from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import sqlite3
from database import get_db
# from utils.pdf_generator import generate_pdf_report
import datetime
from services.analytics_service import AnalyticsService
from fastapi import Depends

router = APIRouter(
    prefix="/estadisticas",
    tags=["estadisticas"],
    responses={404: {"description": "Not found"}},
)

def get_analytics_service(db: sqlite3.Connection = Depends(get_db)) -> AnalyticsService:
    """Dependency Injection para el servicio de analytics"""
    return AnalyticsService(db)

@router.get("/diarias")
async def get_daily_summary(service: AnalyticsService = Depends(get_analytics_service)):
    """Obtiene un resumen diario de estadísticas (Totales de hoy)"""
    try:
        # Obtenemos la fecha de hoy en formato YYYY-MM-DD
        today = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        # tomorrow = (datetime.datetime.now() + datetime.timedelta(days=1)).isoformat()
        print("Fecha para estadísticas diarias:", today)
        
        # Llamamos al servicio
        summary = service.get_daily_summary(today)
        return summary
    
    except Exception as e:
        # Es mejor capturar Exception general si el servicio lanza errores genéricos
        raise HTTPException(status_code=500, detail=f"Error obteniendo estadísticas: {str(e)}")
    
    