
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


class FastAPIApp:
    _instance = None
    _app = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FastAPIApp, cls).__new__(cls)
            cls._app = FastAPI(title="API - TURNERO MEDICO")
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
from routers import path_router, paciente_router, rol_router, especialidad_router

FastAPIApp.include_router(path_router)
FastAPIApp.include_router(paciente_router)
FastAPIApp.include_router(rol_router)
FastAPIApp.include_router(especialidad_router)


# Evento de cierre: cerrar la conexión a la base de datos
@app.on_event("shutdown")
def shutdown_event():
    """Cierra la conexión a la base de datos al apagar la aplicación"""
    DatabaseConnection.close()

