from fastapi import APIRouter

# Crear un router para este controlador
router = APIRouter(
    tags=["GET PATH"],
    responses={404: {"description": "Not found"}},
)

# Endpoints del controlador
@router.get("/")
async def get_path():
    return [
        {"message": "API corriendo correctamente!"},
    ]


