# aca se determinan los endpoints para devolver estadisticas y reportes del sistema
# AnalyticsRouter

# GET /estadisticas/diarias - Resumen del día (Totales hoy). Devuelve Turnos totales, pacientes atendidos, cancelados, nuevos registros. hasta ese momento en ese dia
# GET /estadisticas/especialidad - Turnos por especialidad.
# GET /estadisticas/rendimiento-medico - Listado de turnos por doctor. Entre 2 fechas. Lista de objetos como Ej: {"id": 101,"date": "2025-10-20", "time": "09:00", "patient": "Gomez, Juan", "socialWork": "OSDE 210", "status": "Atendido"}
# GET /estadisticas/rendimiento-medico/pdf - Descarga de reporte PDF.
# GET /estadisticas/volumen-pacientes - Evolución de pacientes en el tiempo.
# GET /estadisticas/asistencia - Comparativa Asistencias vs. Inasistencias.


from services.medico_service import MedicoService
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import FileResponse
import sqlite3
from database import get_db
# from utils.pdf_generator import generate_pdf_report
import datetime
from services.analytics_service import AnalyticsService
from fastapi import Depends
from utils.pdf_downloader import generar_pdf_rendimiento

router = APIRouter(
    prefix="/estadisticas",
    tags=["estadisticas"],
    responses={404: {"description": "Not found"}},
)

def get_analytics_service(db: sqlite3.Connection = Depends(get_db)) -> AnalyticsService:
    """Dependency Injection para el servicio de analytics"""
    return AnalyticsService(db)

def get_medico_service(db: sqlite3.Connection = Depends(get_db)) -> MedicoService:
    """Dependency Injection para el servicio de médicos"""
    return MedicoService(db)

@router.get("/volumen-pacientes")
async def get_volumen_pacientes(fecha_desde:str, fecha_hasta:str, service: AnalyticsService = Depends(get_analytics_service)):
    """Obtiene la evolución del volumen de pacientes en el tiempo"""
    try:
        stats = service.get_volumen_pacientes(fecha_desde, fecha_hasta)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo volumen de pacientes: {str(e)}")

@router.get("/diarias")
async def get_resumen_diario(service: AnalyticsService = Depends(get_analytics_service)):
    """Obtiene un resumen diario de estadísticas (Totales de hoy)"""
    try:
        # Obtenemos la fecha de hoy en formato YYYY-MM-DD
        today = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        # tomorrow = (datetime.datetime.now() + datetime.timedelta(days=1)).isoformat()
        print("Fecha para estadísticas diarias:", today)
        
        # Llamamos al servicio
        summary = service.get_resumen_diario(today)
        return summary
    
    except Exception as e:
        # Es mejor capturar Exception general si el servicio lanza errores genéricos
        raise HTTPException(status_code=500, detail=f"Error obteniendo estadísticas: {str(e)}")
    


@router.get("/rendimiento-medico/pdf")
async def get_rendimiento_medico_pdf(
    fecha_desde: str,
    fecha_hasta: str,
    id_medico: int=None,
    service: AnalyticsService = Depends(get_analytics_service),
    medico_service: MedicoService = Depends(get_medico_service)
):
    """
    Descarga el reporte en PDF.
    Uso: GET /estadisticas/rendimiento-medico/pdf?fecha_desde=...&fecha_hasta=...
    """
    try:
        # 1. Reutilizamos la lógica del servicio para obtener los datos crudos
        datos_json = service.get_rendimiento_medico(fecha_desde, fecha_hasta, id_medico)
        print("Datos para PDF:", datos_json)
        
        if not datos_json:
            raise HTTPException(status_code=404, detail="No hay datos para generar el reporte en esas fechas.")
        
        info_medico = "Reporte General (Todos los médicos)"
        
        if id_medico:
            # Buscamos al médico para sacar su nombre lindo
            medico = medico_service.get_by_id(id_medico)
            if medico:
                info_medico = f"Dr/a. {medico.apellido}, {medico.nombre} (MN: {medico.matricula})"

        # 2. Generamos el PDF en memoria (bytes)
        pdf_bytes = generar_pdf_rendimiento(datos_json, fecha_desde, fecha_hasta, info_extra=info_medico)

        # 3. Configuramos los Headers para que el navegador descargue el archivo
        headers = {
            "Content-Disposition": f"attachment; filename=reporte_medico_{fecha_desde}.pdf"
        }

        # 4. Devolvemos una respuesta de tipo 'application/pdf'
        return Response(content=bytes(pdf_bytes), media_type="application/pdf", headers=headers)
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error generando PDF: {str(e)}")

@router.post("/turnos_por_especialidad")
async def get_turnos_por_especialidad(fechas:dict, service: AnalyticsService = Depends(get_analytics_service)):
    """Obtiene estadísticas de turnos por especialidad"""
    try:
        stats = service.get_turnos_por_especialidad(fechas.get("fecha_desde"), fechas.get("fecha_hasta"))
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo estadísticas por especialidad: {str(e)}")
    
@router.post("/rendimiento-medico")
async def get_rendimiento_medico(
    datos: dict,
      service: AnalyticsService = Depends(get_analytics_service)):
    """Obtiene el rendimiento de médicos entre dos fechas"""
    try:
        stats = service.get_rendimiento_medico(datos.get("fecha_desde"), datos.get("fecha_hasta"), datos.get("id_medico"))
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error obteniendo rendimiento médico: {str(e)}")
    

