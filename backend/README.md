# Arquitectura del Backend - Turnero Médico

## Patrón Singleton para FastAPI

Este proyecto implementa un **Singleton** para la instancia de FastAPI siguiendo principios de diseño sólidos.

### ¿Por qué Singleton?

El patrón Singleton garantiza que:
- ✅ Solo existe una instancia de la aplicación FastAPI en todo el ciclo de vida
- ✅ Todos los controladores usan la misma instancia
- ✅ La configuración se aplica de manera consistente
- ✅ Se facilita el testing y el mantenimiento

### Estructura del Proyecto

```
backend/
├── api.py                 # Punto de entrada con Singleton de FastAPI
├── config.py              # Configuración centralizada
├── requirements.txt       # Dependencias
├── routers/               # Controladores
├── services/             # Lógica de negocio y acceso a datos
└── models/              # Modelos de datos
```

### Cómo Usar el Singleton

#### 1. En los Controladores

Los controladores usan **APIRouter** de FastAPI, no necesitan acceder directamente al singleton:

```python
from fastapi import APIRouter

router = APIRouter(
    prefix="/routeName",
)

#### 2. Registrar Controladores

En `api.py`, registra los routers:

```python
from controllers import xx_router

FastAPIApp.include_router(xx_router)
```


### Dependency Injection en FastAPI

FastAPI tiene su propio sistema de **Dependency Injection** que debes usar para servicios y repositorios:

```python
from fastapi import Depends

def get_user_service():
    return UserService()

@router.get("/users")
async def get_users(service: UserService = Depends(get_user_service)):
    return service.get_all()
```


### Configuración de la Base de Datos

La aplicación usa **SQLite** ubicada en la carpeta `../database/turnero_medico.db`.

La conexión se maneja mediante un **Singleton** (`DatabaseConnection`) que:
- ✅ Garantiza una única conexión compartida
- ✅ Usa Dependency Injection de FastAPI
- ✅ Cierra automáticamente al apagar la aplicación
- ✅ Maneja transacciones y rollbacks


### Ejecutar la Aplicación

```bash
# Instalar dependencias
pip install -r requirements.txt

# Inicializar la base de datos (si es necesario)
cd ../database
python db_init.py
cd ../backend

# Ejecutar el servidor
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

### Documentación Automática

FastAPI genera documentación automática:
- Swagger UI: http://localhost:8000/docs
