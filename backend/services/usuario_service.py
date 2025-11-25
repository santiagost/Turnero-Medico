import sqlite3
from typing import List, Optional
from models.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse


class UsuarioService:
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cursor = db.cursor()

    def _get_usuario_completo(self, usuario_id: int) -> Optional[UsuarioResponse]:
        """Obtiene un usuario completo por ID"""
        self.cursor.execute("SELECT * FROM usuario WHERE id_usuario = ?", (usuario_id,))
        row = self.cursor.fetchone()
        if not row:
            return None
        
        usuario_dict = dict(row)
        return UsuarioResponse(
            id_usuario=usuario_dict['id_usuario'],
            email=usuario_dict['email'],
            activo=bool(usuario_dict['activo']),
            recordatorios_activados=bool(usuario_dict['recordatorios_activados'])
        )

        
    def get_all(self) -> List[UsuarioResponse]:
        """Obtiene todos los usuarios"""
        self.cursor.execute("SELECT * FROM usuario")
        rows = self.cursor.fetchall()
        usuarios = []
        for row in rows:
            usuario_id = dict(row)['id_usuario']
            usuario_completo = self._get_usuario_completo(usuario_id)
            if usuario_completo:
                usuarios.append(usuario_completo)
        return usuarios
        

    def get_by_id(self, usuario_id: int) -> Optional[UsuarioResponse]:
        """Obtiene un usuario por ID"""
        # self.cursor.execute("SELECT * FROM usuario WHERE id_usuario = ?", (usuario_id,))
        # row = self.cursor.fetchone()
    
        usuario = self._get_usuario_completo(usuario_id)
        if usuario is None:
            raise ValueError("Usuario no encontrado")
        return usuario
        


        # if row:
        #     usuario_dict = dict(row)
        #     return UsuarioResponse(
        #         id_usuario=usuario_dict['id_usuario'],
        #         email=usuario_dict['email'],
        #         creado_en=usuario_dict['creado_en'],
        #         activo=usuario_dict['activo']
        #     )
        # return None
    

    def create(self, usuario_data: UsuarioCreate) -> UsuarioResponse:
        """Crea un nuevo usuario"""
        try:
            self.cursor.execute(
                "INSERT INTO usuario (email, password_hash) VALUES (?, ?)",
                (usuario_data.email, usuario_data.password)
            )
            self.db.commit()
            new_id = self.cursor.lastrowid
            return self.get_by_id(new_id)
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al crear el usuario: " + str(e))
        
    def update(self, usuario_id: int, usuario_data: dict) -> Optional[UsuarioResponse]:
        """Actualiza un usuario existente"""
        existing = self.get_by_id(usuario_id)
        if not existing:
            return None
                                                        # contraseña no ?
        email = usuario_data.get('email', existing.email)
        activo = usuario_data.get('activo', existing.activo)
        
        try:
            self.cursor.execute(
                "UPDATE usuario SET email = ?, activo = ? WHERE id_usuario = ?",
                (email, activo, usuario_id)
            )
            self.db.commit()
            return self.get_by_id(usuario_id)
        
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al actualizar el usuario: " + str(e))
        
    def delete(self, usuario_id: int) -> bool:
        """Elimina un usuario por ID"""
        existing = self.get_by_id(usuario_id)
        if not existing:
            return False
        
        try:
            self.cursor.execute("DELETE FROM usuario WHERE id_usuario = ?", (usuario_id,))
            self.db.commit()
            return True
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al eliminar el usuario: " + str(e))