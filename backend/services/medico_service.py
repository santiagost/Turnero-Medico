import sqlite3
from typing import List, Optional
from fastapi import HTTPException, status
from models.usuario import UsuarioResponse
from models.medico import MedicoCreate, MedicoUpdate, MedicoResponse
from models.especialidad import EspecialidadResponse


class MedicoService:
    
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cursor = db.cursor()
    
    def _get_medico_completo(self, medico_id: int) -> Optional[MedicoResponse]:
        """
        Método privado: Obtiene un medico con sus relaciones (usuario y especialidad).
        """
        # Obtener datos del medico
        self.cursor.execute("SELECT * FROM medico WHERE id_medico = ?", (medico_id,))
        medico_row = self.cursor.fetchone()
        
        if not medico_row:
            return None
        
        medico_dict = dict(medico_row)
        
        # Obtener datos del usuario si existe
        usuario_obj = None
        if medico_dict.get('id_usuario'):
            self.cursor.execute("SELECT * FROM Usuario WHERE id_usuario = ?", (medico_dict['id_usuario'],))
            usuario_row = self.cursor.fetchone()
            if usuario_row:
                usuario_data = dict(usuario_row)
                usuario_obj = UsuarioResponse(
                    email=usuario_data['email'],
                    id_usuario=usuario_data['id_usuario'],
                    activo=bool(usuario_data['activo']),
                    recordatorios_activados=bool(usuario_data['recordatorios_activados'])
                )
        
        # Obtener datos de la especialidad si existe
        especialidad_obj = None
        if medico_dict.get('id_especialidad'):
            self.cursor.execute("SELECT * FROM especialidad WHERE id_especialidad = ?", (medico_dict['id_especialidad'],))
            especialidad_row = self.cursor.fetchone()
            if especialidad_row:
                especialidad_data = dict(especialidad_row)
                especialidad_obj = EspecialidadResponse(
                    id_especialidad=especialidad_data['id_especialidad'],
                    nombre=especialidad_data['nombre'],
                    descripcion=especialidad_data['descripcion'],
                )
        
        # Crear objeto MedicoResponse
        return MedicoResponse(
            id_medico=medico_dict['id_medico'],
            matricula=medico_dict['matricula'],
            dni=medico_dict['dni'],
            nombre=medico_dict['nombre'],
            apellido=medico_dict['apellido'],
            telefono=medico_dict['telefono'],
            id_usuario=medico_dict.get('id_usuario'),
            id_especialidad=medico_dict.get('id_especialidad'),
            usuario=usuario_obj,
            especialidad=especialidad_obj,
            noti_cancel_email_act=bool(medico_dict.get('noti_cancel_email_act', 1))
        )
    
    def get_all(self) -> List[MedicoResponse]:
        """
        Obtiene todos los medicos con sus relaciones.
        """
        try:
            self.cursor.execute("SELECT id_medico FROM medico")
            rows = self.cursor.fetchall()
            
            medicos = []
            for row in rows:
                medico_id = dict(row)['id_medico']
                medico_completo = self._get_medico_completo(medico_id)
                if medico_completo:
                    medicos.append(medico_completo)
            
            return medicos
            
        except sqlite3.Error as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al obtener los médicos: {str(e)}"
            )
    
    def get_by_id(self, medico_id: int) -> MedicoResponse:
        """
        Obtiene un médico por su ID con sus relaciones.
        """
        try:
            medico = self._get_medico_completo(medico_id)
            
            if not medico:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Médico con ID {medico_id} no encontrado"
                )
            
            return medico
            
        except sqlite3.Error as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al obtener el médico: {str(e)}"
            )
    
    def create(self, medico_data) -> MedicoResponse:
        """
        Crea un nuevo medico.
        medico_data: MedicoCreate
        """
        try:
            # Validar DNI único
            self.cursor.execute("SELECT id_medico FROM medico WHERE dni = ?", (medico_data.dni,))
            if self.cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Ya existe un medico con DNI {medico_data.dni}"
                )
            
            # Validar matrícula única
            self.cursor.execute("SELECT id_medico FROM medico WHERE matricula = ?", (medico_data.matricula,))
            if self.cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Ya existe un medico con matrícula {medico_data.matricula}"
                )
            
            # Insertar nuevo medico
            self.cursor.execute("""
                INSERT INTO Medico (dni, nombre, apellido, matricula, telefono, id_especialidad, id_usuario)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                medico_data.dni,
                medico_data.nombre,
                medico_data.apellido,
                medico_data.matricula,
                medico_data.telefono,
                medico_data.id_especialidad,
                medico_data.id_usuario
            ))
            
            self.db.commit()
            
            # Obtener el medico recién creado
            medico_id = self.cursor.lastrowid
            return self._get_medico_completo(medico_id)
            
        except sqlite3.Error as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al crear medico: {str(e)}"
            )
    
    def update(self, medico_id: int, medico_data) -> MedicoResponse:
        """
        Actualiza los datos de un medico existente.
        medico_data: MedicoUpdate
        """
        try:
            # Verificar existencia
            self.cursor.execute("SELECT id_medico FROM Medico WHERE id_medico = ?", (medico_id,))
            if not self.cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Medico con ID {medico_id} no encontrado"
                )
            
            # Construir query dinámico
            update_fields = []
            update_values = []
            
            # Verificar cada campo del objeto MedicoUpdate
            if medico_data.nombre is not None:
                update_fields.append("nombre = ?")
                update_values.append(medico_data.nombre)
            if medico_data.apellido is not None:
                update_fields.append("apellido = ?")
                update_values.append(medico_data.apellido)
            if medico_data.telefono is not None:
                update_fields.append("telefono = ?")
                update_values.append(medico_data.telefono)
            if medico_data.id_especialidad is not None:
                update_fields.append("id_especialidad = ?")
                update_values.append(medico_data.id_especialidad)
            
            if not update_fields:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se proporcionaron campos para actualizar"
                )
            
            # Agregar el ID
            update_values.append(medico_id)
            
            # Ejecutar update
            query = f"UPDATE Medico SET {', '.join(update_fields)} WHERE id_medico = ?"
            self.cursor.execute(query, update_values)
            self.db.commit()
            
            # Retornar medico actualizado
            return self._get_medico_completo(medico_id)
            
        except sqlite3.Error as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al actualizar medico: {str(e)}"
            )
    
    def delete(self, medico_id: int) -> None:
        """
        Elimina un medico por su ID.
        """
        try:
            # Verificar existencia
            self.cursor.execute("SELECT id_medico FROM medico WHERE id_medico = ?", (medico_id,))
            if not self.cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Medico con ID {medico_id} no encontrado"
                )
            
            # Eliminar
            self.cursor.execute("DELETE FROM Medico WHERE id_medico = ?", (medico_id,))
            self.db.commit()
            
        except sqlite3.Error as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al eliminar medico: {str(e)}"
            )