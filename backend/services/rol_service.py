from http.client import HTTPException
import sqlite3
from typing import List, Optional
from models.rol import RolResponse, RolCreate, RolUpdate


class RolService:
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cursor = db.cursor()

    def _get_rol_completo(self, rol_id: int) -> Optional[RolResponse]:
        """Obtiene un rol completo por ID"""
        self.cursor.execute("SELECT * FROM rol WHERE id_rol = ?", (rol_id,))
        row = self.cursor.fetchone()
        if not row:
            return None
        
        role_dict = dict(row)
        return RolResponse(
            id_rol=role_dict['id_rol'],
            nombre=role_dict['nombre'],
            descripcion=role_dict.get('descripcion')
        )
    

    def get_all(self) -> List[RolResponse]:
        """Obtiene todos los roles"""
        self.cursor.execute("SELECT * FROM rol")
        rows = self.cursor.fetchall()
        roles = []
        for row in rows:
            rol_id = dict(row)['id_rol']
            rol_completo = self._get_rol_completo(rol_id)
            if rol_completo:
                roles.append(rol_completo)
        return roles

    def get_by_id(self, rol_id: int) -> Optional[RolResponse]:
        """Obtiene un rol por su ID"""
        return self._get_rol_completo(rol_id)

    def create(self, rol_data: RolCreate) -> RolResponse:
        """Crea un nuevo rol"""
        try:
            self.cursor.execute("""
                INSERT INTO rol (nombre, descripcion)
                VALUES (?, ?)
            """, (
                rol_data.nombre,
                rol_data.descripcion
            ))
            
            self.db.commit()
            
            # Obtener el rol recién creado
            rol_id = self.cursor.lastrowid
            return self._get_rol_completo(rol_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError(f"Error al crear el rol: {e}")
        

    def update(self, rol_id: int, rol_data: RolUpdate) -> Optional[RolResponse]:
        """Actualiza los datos de un rol existente"""
        existing = self.get_by_id(rol_id)
        if not existing:
            return None
        
        try:
            nombre = rol_data.nombre if rol_data.nombre is not None else existing.nombre
            descripcion = rol_data.descripcion if rol_data.descripcion is not None else existing.descripcion
            
            self.cursor.execute("""
                UPDATE rol SET nombre = ?, descripcion = ?
                WHERE id_rol = ?
            """, (nombre, descripcion, rol_id))
            
            self.db.commit()
            
            return self._get_rol_completo(rol_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError(f"Error al actualizar el rol: {e}")
    
    def delete(self, rol_id: int) -> bool:
        """Elimina un rol por su ID"""
        existing = self.get_by_id(rol_id)
        if not existing:
            return False
        
        try:
            self.cursor.execute("DELETE FROM rol WHERE id_rol = ?", (rol_id,))
            self.db.commit()
            return True
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError(f"Error al eliminar el rol: {e}")
        
                    
    def get_by_name(self, nombre: str) -> Optional[RolResponse]:
        """Obtiene un rol por su nombre"""
        self.cursor.execute("SELECT * FROM rol WHERE nombre = ?", (nombre,))
        row = self.cursor.fetchone()
        if not row:
            raise ValueError(f"Rol '{nombre}' no existe")

        role_dict = dict(row)
        return RolResponse(
            id_rol=role_dict['id_rol'],
            nombre=role_dict['nombre'],
            descripcion=role_dict.get('descripcion')
        )
            


