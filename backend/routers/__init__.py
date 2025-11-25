"""
Módulo de controladores.
Importa todos los routers de los controladores para registrarlos en la aplicación.
"""
from .path_router import router as path_router
from .paciente_router import router as paciente_router
from .rol_router import router as rol_router
from .especialidad_router import router as especialidad_router
from .obra_social_router import router as obra_social_router
from .estado_turno_router import router as estado_turno_router
from .usuario_router import router as usuario_router
from .medico_router import router as medico_router
from .turno_router import router as turno_router
from .consulta_router import router as consulta_router
from .usuario_rol_router import router as usuario_rol_router
from .receta_router import router as receta_router
from .horario_atencion_router import router as horario_atencion_router
from .analytics_router import router as analytics_router

# Lista de todos los routers disponibles
__all__ = ["path_router",
           "paciente_router",
           "rol_router",
           "especialidad_router",
           "obra_social_router",
           "estado_turno_router",
           "usuario_router",
           "medico_router",
           "turno_router",
           "consulta_router",
           "usuario_rol_router",
           "receta_router",
           "horario_atencion_router",
           "analytics_router"]