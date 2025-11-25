import sqlite3
from typing import List, Optional
from models.usuarioRol import UsuarioRolResponse, UsuarioRolCreate
from services.usuario_service import UsuarioService
from services.rol_service import RolService


class UsuarioRolService:
    
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cursor = db.cursor()
    
    def _get_usuario_rol_completo(self, id_usuario: int, id_rol: int) -> Optional[UsuarioRolResponse]:
        """Obtiene un usuario_rol con sus relaciones"""
        self.cursor.execute("""
            SELECT * FROM UsuarioRol 
            WHERE id_usuario = ? AND id_rol = ?
        """, (id_usuario, id_rol))
        
        row = self.cursor.fetchone()
        
        if not row:
            return None
        
        data = dict(row)
        
        # Obtener usuario completo usando UsuarioService
        usuario_obj = None
        if data.get('id_usuario'):
            usuario_service = UsuarioService(self.db)
            usuario_obj = usuario_service.get_by_id(data['id_usuario'])
        
        # Obtener rol completo usando RolService
        rol_obj = None
        if data.get('id_rol'):
            rol_service = RolService(self.db)
            rol_obj = rol_service.get_by_id(data['id_rol'])
        
        return UsuarioRolResponse(
            id_usuario=data['id_usuario'],
            id_rol=data['id_rol'],
            usuario=usuario_obj,
            rol=rol_obj
        )
    
    def get_all(self) -> List[UsuarioRolResponse]:
        """Obtiene todas las relaciones usuario-rol"""
        self.cursor.execute("SELECT id_usuario, id_rol FROM UsuarioRol")
        rows = self.cursor.fetchall()
        
        usuario_roles = []
        for row in rows:
            data = dict(row)
            usuario_rol_completo = self._get_usuario_rol_completo(data['id_usuario'], data['id_rol'])
            if usuario_rol_completo:
                usuario_roles.append(usuario_rol_completo)
        
        return usuario_roles
    
    def get_by_usuario_id(self, usuario_id: int) -> List[UsuarioRolResponse]:
        """Obtiene todos los roles de un usuario"""
        self.cursor.execute("SELECT id_usuario, id_rol FROM UsuarioRol WHERE id_usuario = ?", (usuario_id,))
        rows = self.cursor.fetchall()
        
        roles = []
        for row in rows:
            data = dict(row)
            usuario_rol_completo = self._get_usuario_rol_completo(data['id_usuario'], data['id_rol'])
            if usuario_rol_completo:
                roles.append(usuario_rol_completo)
        
        return roles
    
    def get_by_rol_id(self, rol_id: int) -> List[UsuarioRolResponse]:
        """Obtiene todos los usuarios con un rol específico"""
        self.cursor.execute("SELECT id_usuario, id_rol FROM UsuarioRol WHERE id_rol = ?", (rol_id,))
        rows = self.cursor.fetchall()
        
        usuarios = []
        for row in rows:
            data = dict(row)
            usuario_rol_completo = self._get_usuario_rol_completo(data['id_usuario'], data['id_rol'])
            if usuario_rol_completo:
                usuarios.append(usuario_rol_completo)
        
        return usuarios
    
    def create(self, usuario_rol_data: UsuarioRolCreate) -> UsuarioRolResponse:
        """Crea una nueva relación usuario-rol"""
        try:
            # Validar que el usuario existe
            self.cursor.execute("SELECT id_usuario FROM Usuario WHERE id_usuario = ?", (usuario_rol_data.id_usuario,))
            if not self.cursor.fetchone():
                raise ValueError(f"No existe un usuario con ID {usuario_rol_data.id_usuario}")
            
            # Validar que el rol existe
            self.cursor.execute("SELECT id_rol FROM Rol WHERE id_rol = ?", (usuario_rol_data.id_rol,))
            if not self.cursor.fetchone():
                raise ValueError(f"No existe un rol con ID {usuario_rol_data.id_rol}")
            
            # Validar que la relación no existe
            self.cursor.execute("""
                SELECT * FROM UsuarioRol WHERE id_usuario = ? AND id_rol = ?
            """, (usuario_rol_data.id_usuario, usuario_rol_data.id_rol))
            if self.cursor.fetchone():
                raise ValueError(f"El usuario {usuario_rol_data.id_usuario} ya tiene el rol {usuario_rol_data.id_rol}")
            
            # Insertar nueva relación
            self.cursor.execute("""
                INSERT INTO UsuarioRol (id_usuario, id_rol)
                VALUES (?, ?)
            """, (
                usuario_rol_data.id_usuario,
                usuario_rol_data.id_rol
            ))
            
            self.db.commit()
            
            # Obtener la relación recién creada
            return self._get_usuario_rol_completo(usuario_rol_data.id_usuario, usuario_rol_data.id_rol)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al crear la relación usuario-rol: " + str(e))
    
    def delete(self, id_usuario: int, id_rol: int) -> bool:
        """Elimina una relación usuario-rol"""
        existing = self._get_usuario_rol_completo(id_usuario, id_rol)
        if not existing:
            return False
        
        try:
            # Eliminar
            self.cursor.execute("""
                DELETE FROM UsuarioRol 
                WHERE id_usuario = ? AND id_rol = ?
            """, (id_usuario, id_rol))
            self.db.commit()
            return True
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al eliminar la relación usuario-rol: " + str(e))
