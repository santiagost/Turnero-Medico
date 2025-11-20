"""
Servicio de gestión de roles de usuario. - Contiene la lógica de negocio y acceso a datos
"""

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
        rol_row = self.cursor.fetchone()
        if not rol_row:
            return None
        
        role_dict = dict(rol_row)
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

    # def get_by_id(self, rol_id: int) -> Optional[RolResponse]:
    #     """Obtiene un rol por ID"""
    #     self.cursor.execute("SELECT * FROM roles WHERE id_rol = ?", (rol_id,))
    #     row = self.cursor.fetchone()
    #     if row:
    #         role_dict = dict(row)
    #         return RolResponse(
    #             id_rol=role_dict['id_rol'],
    #             nombre=role_dict['nombre'],
    #             descripcion=role_dict.get('descripcion')
    #         )
    #     return None

    # def create(self, rol_data: RolCreate) -> RolResponse:
    #     """Crea un nuevo rol"""
    #     self.cursor.execute(
    #         "INSERT INTO roles (nombre, descripcion) VALUES (?, ?)",
    #         (rol_data.nombre, rol_data.descripcion)
    #     )
    #     self.db.commit()
    #     rol_id = self.cursor.lastrowid
    #     return self.get_by_id(rol_id)

    # def update(self, rol_id: int, rol_data: RolUpdate) -> Optional[RolResponse]:
    #     """Actualiza un rol existente"""
    #     existing_rol = self.get_by_id(rol_id)
    #     if not existing_rol:
    #         return None

    #     nombre = rol_data.nombre if rol_data.nombre is not None else existing_rol.nombre
    #     descripcion = rol_data.descripcion if rol_data.descripcion is not None else existing_rol.descripcion

    #     self.cursor.execute(
    #         "UPDATE roles SET nombre = ?, descripcion = ? WHERE id_rol = ?",
    #         (nombre, descripcion, rol_id)
    #     )
    #     self.db.commit()
    #     return self.get_by_id(rol_id)