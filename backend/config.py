"""
Configuración centralizada de la aplicación.
Maneja variables de entorno y configuración general.
"""
from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path


# Obtener la ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_DIR = BASE_DIR / "database"


class Settings(BaseSettings):
    """Configuración de la aplicación usando Pydantic Settings"""
    
    # API Configuration
    app_name: str = "API - TURNERO MEDICO"
    app_version: str = "1.0.0"
    debug: bool = True
    
    # CORS Configuration
    cors_origins: List[str] = ["*"]
    cors_credentials: bool = True
    cors_methods: List[str] = ["*"]
    cors_headers: List[str] = ["*"]
    
    # Database Configuration
    database_url: str = f"sqlite:///{DATABASE_DIR}/turnero_medico.db"
    

_settings = None


def get_settings() -> Settings:
    """
    Retorna la instancia singleton de configuración.
    Dependency Injection para usar en FastAPI.
    """
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings


# Exportar la instancia para uso directo si es necesario
settings = get_settings()
