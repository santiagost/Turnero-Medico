
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def chequear_recordatorios_background(): # para testear el scheduler
    print("Esta es una tarea de ejemplo que se ejecuta cada 10 segundos")
    
    ## para continuar con la implementacion de las notificaciones hay que tener primero 
    ## los routers y servicios hechos para los usuarios, pacientes, medicos y turnos
    ## TurnoService.chequear_y_enviar_recordatorios() METODO ESTATICO A IMPLEMENTAR
    


# --- LIFESPAN (Ciclo de vida de FastAPI) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Al iniciar la app: Arrancar el Scheduler
    scheduler = BackgroundScheduler()
    
    # Configuramos para que corra cada 10 o 30 segundos
    # scheduler.add_job(chequear_recordatorios_background, 'interval', seconds=30)
    scheduler.add_job(chequear_recordatorios_background, 'interval', seconds=10)
    
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

# Inicializar la conexión a la base de datos
from database import DatabaseConnection
DatabaseConnection()

# Registrar los routers de los controladores
from routers import path_router, paciente_router, rol_router, especialidad_router, obra_social_router, estado_turno_router, usuario_router, medico_router


FastAPIApp.include_router(path_router)
FastAPIApp.include_router(paciente_router)
FastAPIApp.include_router(rol_router)
FastAPIApp.include_router(especialidad_router)
FastAPIApp.include_router(obra_social_router)
FastAPIApp.include_router(estado_turno_router)
FastAPIApp.include_router(usuario_router)
FastAPIApp.include_router(medico_router)

# Evento de cierre: cerrar la conexión a la base de datos
@app.on_event("shutdown")
def shutdown_event():
    """Cierra la conexión a la base de datos al apagar la aplicación"""
    DatabaseConnection.close()

