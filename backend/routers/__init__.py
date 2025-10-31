"""
Módulo de controladores.
Importa todos los routers de los controladores para registrarlos en la aplicación.
"""
from .path_router import router as path_router
from .paciente_router import router as paciente_router

# Lista de todos los routers disponibles
__all__ = ["path_router", "paciente_router"]
