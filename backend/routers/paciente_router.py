"""
Controlador de pacientes - Maneja todas las operaciones relacionadas con pacientes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import sqlite3
from database import get_db
from models.schemas import PacienteResponse, PacienteCreate, PacienteUpdate


# Crear un router para este controlador
router = APIRouter(
    prefix="/pacientes",
    tags=["Pacientes"],
    responses={404: {"description": "Not found"}},
)


def get_paciente_completo(cursor: sqlite3.Cursor, paciente_id: int) -> dict:
    """
    Obtiene un paciente con sus relaciones (usuario y obra social).
    """
    # Obtener datos del paciente
    cursor.execute("SELECT * FROM Paciente WHERE id_paciente = ?", (paciente_id,))
    paciente_row = cursor.fetchone()
    
    if not paciente_row:
        return None
    
    paciente_dict = dict(paciente_row)
    
    # Obtener datos del usuario si existe
    if paciente_dict.get('id_usuario'):
        cursor.execute("SELECT * FROM Usuario WHERE id_usuario = ?", (paciente_dict['id_usuario'],))
        usuario_row = cursor.fetchone()
        paciente_dict['usuario'] = dict(usuario_row) if usuario_row else None
    else:
        paciente_dict['usuario'] = None
    
    # Obtener datos de la obra social si existe
    if paciente_dict.get('id_obra_social'):
        cursor.execute("SELECT * FROM ObraSocial WHERE id_obra_social = ?", (paciente_dict['id_obra_social'],))
        obra_social_row = cursor.fetchone()
        paciente_dict['obra_social'] = dict(obra_social_row) if obra_social_row else None
    else:
        paciente_dict['obra_social'] = None
    
    return paciente_dict


@router.get("/", response_model=List[PacienteResponse])
async def get_all_pacientes(db: sqlite3.Connection = Depends(get_db)):
    """
    Obtiene todos los pacientes con sus relaciones (usuario y obra social).
    """
    try:
        cursor = db.cursor()
        cursor.execute("SELECT id_paciente FROM Paciente")
        rows = cursor.fetchall()
        
        pacientes = []
        for row in rows:
            paciente_id = dict(row)['id_paciente']
            paciente_completo = get_paciente_completo(cursor, paciente_id)
            if paciente_completo:
                pacientes.append(paciente_completo)
        
        return pacientes
        
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener pacientes: {str(e)}"
        )


@router.get("/{paciente_id}", response_model=PacienteResponse)
async def get_paciente_by_id(paciente_id: int, db: sqlite3.Connection = Depends(get_db)):
    """
    Obtiene un paciente por su ID con sus relaciones.
    """
    try:
        cursor = db.cursor()
        paciente = get_paciente_completo(cursor, paciente_id)
        
        if not paciente:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Paciente con ID {paciente_id} no encontrado"
            )
        
        return paciente
        
    except sqlite3.Error as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener paciente: {str(e)}"
        )


@router.post("/", response_model=PacienteResponse, status_code=status.HTTP_201_CREATED)
async def create_paciente(paciente: PacienteCreate, db: sqlite3.Connection = Depends(get_db)):
    """
    Crea un nuevo paciente.
    """
    try:
        cursor = db.cursor()

        # Verificar si ya existe un paciente con ese DNI
        cursor.execute("SELECT id_paciente FROM Paciente WHERE dni = ?", (paciente.dni,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ya existe un paciente con DNI {paciente.dni}"
            )
        
        # Verificar si ya existe un paciente con ese id_obra_social y nro_afiliado
        if paciente.id_obra_social and paciente.nro_afiliado:
            cursor.execute(
                "SELECT id_paciente FROM Paciente WHERE id_obra_social = ? AND nro_afiliado = ?",
                (paciente.id_obra_social, paciente.nro_afiliado)
            )
            if cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Ya existe un paciente con nro_afiliado {paciente.nro_afiliado} en la obra social"
                )
        
        # Insertar nuevo paciente
        cursor.execute("""
            INSERT INTO Paciente (dni, nombre, apellido, fecha_nacimiento, telefono, id_obra_social, nro_afiliado)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            paciente.dni,
            paciente.nombre,
            paciente.apellido,
            paciente.fecha_nacimiento,
            paciente.telefono,
            paciente.id_obra_social,
            paciente.nro_afiliado
        ))
        
        db.commit()
        
        # Obtener el paciente recién creado con sus relaciones
        paciente_id = cursor.lastrowid
        paciente_creado = get_paciente_completo(cursor, paciente_id)
        
        return paciente_creado
        
    except sqlite3.Error as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear paciente: {str(e)}"
        )


@router.put("/{paciente_id}", response_model=PacienteResponse)
async def update_paciente(
    paciente_id: int,
    paciente_update: PacienteUpdate,
    db: sqlite3.Connection = Depends(get_db)
):
    """
    Actualiza los datos de un paciente existente.
    """
    try:
        cursor = db.cursor()
        
        # Verificar si el paciente existe
        cursor.execute("SELECT id_paciente FROM Paciente WHERE id_paciente = ?", (paciente_id,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Paciente con ID {paciente_id} no encontrado"
            )
        
        # Construir query dinámico solo con los campos que se quieren actualizar
        update_fields = []
        update_values = []
        
        if paciente_update.nombre is not None:
            update_fields.append("nombre = ?")
            update_values.append(paciente_update.nombre)
        
        if paciente_update.apellido is not None:
            update_fields.append("apellido = ?")
            update_values.append(paciente_update.apellido)
        
        if paciente_update.fecha_nacimiento is not None:
            update_fields.append("fecha_nacimiento = ?")
            update_values.append(paciente_update.fecha_nacimiento)
        
        if paciente_update.telefono is not None:
            update_fields.append("telefono = ?")
            update_values.append(paciente_update.telefono)
        
        if paciente_update.id_obra_social is not None:
            update_fields.append("id_obra_social = ?")
            update_values.append(paciente_update.id_obra_social)
        
        if paciente_update.nro_afiliado is not None:
            update_fields.append("nro_afiliado = ?")
            update_values.append(paciente_update.nro_afiliado)
        
        if not update_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se proporcionaron campos para actualizar"
            )
        
        # Agregar el ID al final de los valores
        update_values.append(paciente_id)
        
        # Ejecutar update
        query = f"UPDATE Paciente SET {', '.join(update_fields)} WHERE id_paciente = ?"
        cursor.execute(query, update_values)
        db.commit()
        
        # Obtener el paciente actualizado con sus relaciones
        paciente_actualizado = get_paciente_completo(cursor, paciente_id)
        
        return paciente_actualizado
        
    except sqlite3.Error as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar paciente: {str(e)}"
        )


@router.delete("/{paciente_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_paciente(paciente_id: int, db: sqlite3.Connection = Depends(get_db)):
    """
    Elimina un paciente por su ID.
    """
    try:
        cursor = db.cursor()
        
        # Verificar si el paciente existe
        cursor.execute("SELECT id_paciente FROM Paciente WHERE id_paciente = ?", (paciente_id,))
        if not cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Paciente con ID {paciente_id} no encontrado"
            )
        
        # Eliminar el paciente
        cursor.execute("DELETE FROM Paciente WHERE id_paciente = ?", (paciente_id,))
        db.commit()
        
        return None
        
    except sqlite3.Error as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar paciente: {str(e)}"
        )