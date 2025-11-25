
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# Inicializar la conexión a la base de datos
from database import DatabaseConnection, database_url
from services.turno_service import TurnoService
import sqlite3

DatabaseConnection()




def chequear_recordatorios_background(): # para testear el scheduler
    # turno_router.notificar_recordatorios()
    conn = None
    try:
        # 1. Crear conexión independiente (check_same_thread=False es CLAVE)
        conn = sqlite3.connect(database_url, check_same_thread=False)
        conn.row_factory = sqlite3.Row # Para manejar diccionarios
        
        # 2. Instanciar el servicio con esta conexión
        service = TurnoService(conn)
        
        # 3. Ejecutar la lógica de notificación
        # (Esto imprimirá en consola si manda mails)
        cantidad = service.notificar_recordatorios_turnos()

        if cantidad > 0:
            print(f"[NOTIFICADOR] Se enviaron {cantidad} recordatorios de turnos.")
            
    except Exception as e:
        print(f"[NOTIFICADOR] Error: {e}")
        
    finally:
        # 4. Cerrar la conexión siempre
        if conn:
            conn.close()


# --- LIFESPAN (Ciclo de vida de FastAPI) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Al iniciar la app: Arrancar el Scheduler
    scheduler = BackgroundScheduler()
    
    # Configuramos para que corra cada 10 o 30 segundos
    scheduler.add_job(chequear_recordatorios_background, 'interval', seconds=3600)
    scheduler.start()

    print("Scheduler de notificaciones INICIADO")
    
    yield # Aquí corre tu API
    
    # 2. Al apagar la app: Apagar el Scheduler
    scheduler.shutdown()
    print("Scheduler de notificaciones APAGADO")


class FastAPIApp:
    _instance = None
    _app = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FastAPIApp, cls).__new__(cls)
            cls._app = FastAPI(title="API - TURNERO MEDICO", lifespan=lifespan)
            cls._configure_middleware(cls._app)
        return cls._instance

    @staticmethod
    def _configure_middleware(app: FastAPI):
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @classmethod
    def get_app(cls) -> FastAPI:
        """Retorna la instancia única de FastAPI"""
        if cls._app is None:
            cls()
        return cls._app

    @classmethod
    def include_router(cls, router, **kwargs):
        """Registra un router en la aplicación"""
        cls.get_app().include_router(router, **kwargs)


# Instancia global de la aplicación
app = FastAPIApp.get_app()

# # Inicializar la conexión a la base de datos
# from database import DatabaseConnection
# DatabaseConnection()

# Registrar los routers de los controladores
# from routers import path_router, paciente_router, rol_router, especialidad_router, obra_social_router, estado_turno_router, usuario_router, medico_router
from routers import *


FastAPIApp.include_router(path_router)
FastAPIApp.include_router(paciente_router)
FastAPIApp.include_router(rol_router)
FastAPIApp.include_router(especialidad_router)
FastAPIApp.include_router(obra_social_router)
FastAPIApp.include_router(estado_turno_router)
FastAPIApp.include_router(usuario_router)
FastAPIApp.include_router(medico_router)
FastAPIApp.include_router(turno_router)
FastAPIApp.include_router(consulta_router)
FastAPIApp.include_router(usuario_rol_router)
FastAPIApp.include_router(receta_router)
FastAPIApp.include_router(horario_atencion_router)

# Evento de cierre: cerrar la conexión a la base de datos
@app.on_event("shutdown")
def shutdown_event():
    """Cierra la conexión a la base de datos al apagar la aplicación"""
    DatabaseConnection.close()

