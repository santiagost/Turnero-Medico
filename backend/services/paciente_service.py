"""
Servicio de pacientes - Contiene la lógica de negocio y acceso a datos
"""
import sqlite3
from typing import List, Optional
from fastapi import HTTPException, status


class PacienteService:
    
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cursor = db.cursor()
    
    def _get_paciente_completo(self, paciente_id: int) -> Optional[dict]:
        """
        Método privado: Obtiene un paciente con sus relaciones (usuario y obra social).
        """
        # Obtener datos del paciente
        self.cursor.execute("SELECT * FROM Paciente WHERE id_paciente = ?", (paciente_id,))
        paciente_row = self.cursor.fetchone()
        
        if not paciente_row:
            return None
        
        paciente_dict = dict(paciente_row)
        
        # Obtener datos del usuario si existe
        if paciente_dict.get('id_usuario'):
            self.cursor.execute("SELECT * FROM Usuario WHERE id_usuario = ?", (paciente_dict['id_usuario'],))
            usuario_row = self.cursor.fetchone()
            paciente_dict['usuario'] = dict(usuario_row) if usuario_row else None
        else:
            paciente_dict['usuario'] = None
        
        # Obtener datos de la obra social si existe
        if paciente_dict.get('id_obra_social'):
            self.cursor.execute("SELECT * FROM ObraSocial WHERE id_obra_social = ?", (paciente_dict['id_obra_social'],))
            obra_social_row = self.cursor.fetchone()
            paciente_dict['obra_social'] = dict(obra_social_row) if obra_social_row else None
        else:
            paciente_dict['obra_social'] = None
        
        return paciente_dict
    
    def get_all(self) -> List[dict]:
        """
        Obtiene todos los pacientes con sus relaciones.
        """
        try:
            self.cursor.execute("SELECT id_paciente FROM Paciente")
            rows = self.cursor.fetchall()
            
            pacientes = []
            for row in rows:
                paciente_id = dict(row)['id_paciente']
                paciente_completo = self._get_paciente_completo(paciente_id)
                if paciente_completo:
                    pacientes.append(paciente_completo)
            
            return pacientes
            
        except sqlite3.Error as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al obtener pacientes: {str(e)}"
            )
    
    def get_by_id(self, paciente_id: int) -> dict:
        """
        Obtiene un paciente por su ID con sus relaciones.
        """
        try:
            paciente = self._get_paciente_completo(paciente_id)
            
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
    
    def create(self, paciente_data: dict) -> dict:
        """
        Crea un nuevo paciente.
        """
        try:
            # Validar DNI único
            self.cursor.execute("SELECT id_paciente FROM Paciente WHERE dni = ?", (paciente_data['dni'],))
            if self.cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Ya existe un paciente con DNI {paciente_data['dni']}"
                )
            
            # Validar nro_afiliado único para la obra social
            if paciente_data.get('id_obra_social') and paciente_data.get('nro_afiliado'):
                self.cursor.execute(
                    "SELECT id_paciente FROM Paciente WHERE id_obra_social = ? AND nro_afiliado = ?",
                    (paciente_data['id_obra_social'], paciente_data['nro_afiliado'])
                )
                if self.cursor.fetchone():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Ya existe un paciente con nro_afiliado {paciente_data['nro_afiliado']} en la obra social"
                    )
            
            # Insertar nuevo paciente
            self.cursor.execute("""
                INSERT INTO Paciente (dni, nombre, apellido, fecha_nacimiento, telefono, id_obra_social, nro_afiliado)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                paciente_data['dni'],
                paciente_data['nombre'],
                paciente_data['apellido'],
                paciente_data['fecha_nacimiento'],
                paciente_data.get('telefono'),
                paciente_data.get('id_obra_social'),
                paciente_data.get('nro_afiliado')
            ))
            
            self.db.commit()
            
            # Obtener el paciente recién creado
            paciente_id = self.cursor.lastrowid
            return self._get_paciente_completo(paciente_id)
            
        except sqlite3.Error as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al crear paciente: {str(e)}"
            )
    
    def update(self, paciente_id: int, paciente_data: dict) -> dict:
        """
        Actualiza los datos de un paciente existente.
        """
        try:
            # Verificar existencia
            self.cursor.execute("SELECT id_paciente FROM Paciente WHERE id_paciente = ?", (paciente_id,))
            if not self.cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Paciente con ID {paciente_id} no encontrado"
                )
            
            # Construir query dinámico
            update_fields = []
            update_values = []
            
            for field in ['nombre', 'apellido', 'fecha_nacimiento', 'telefono', 'id_obra_social', 'nro_afiliado']:
                if field in paciente_data and paciente_data[field] is not None:
                    update_fields.append(f"{field} = ?")
                    update_values.append(paciente_data[field])
            
            if not update_fields:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se proporcionaron campos para actualizar"
                )
            
            # Agregar el ID
            update_values.append(paciente_id)
            
            # Ejecutar update
            query = f"UPDATE Paciente SET {', '.join(update_fields)} WHERE id_paciente = ?"
            self.cursor.execute(query, update_values)
            self.db.commit()
            
            # Retornar paciente actualizado
            return self._get_paciente_completo(paciente_id)
            
        except sqlite3.Error as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al actualizar paciente: {str(e)}"
            )
    
    def delete(self, paciente_id: int) -> None:
        """
        Elimina un paciente por su ID.
        """
        try:
            # Verificar existencia
            self.cursor.execute("SELECT id_paciente FROM Paciente WHERE id_paciente = ?", (paciente_id,))
            if not self.cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Paciente con ID {paciente_id} no encontrado"
                )
            
            # Eliminar
            self.cursor.execute("DELETE FROM Paciente WHERE id_paciente = ?", (paciente_id,))
            self.db.commit()
            
        except sqlite3.Error as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al eliminar paciente: {str(e)}"
            )