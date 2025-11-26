from http.client import HTTPException
import sqlite3
from models.usuario import UsuarioUpdate
from models.usuarioRol import UsuarioRolResponse
from utils.security import verify_password, hash_password
from services.usuario_service import UsuarioService
from services.rol_service import RolService
from utils.email_sender import EmailSender
import secrets


class AuthService:
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cursor = db.cursor()
        self.usuario_service = UsuarioService(db)
        self.rol_service = RolService(db)

    def login(self, email: str, password: str, rol: str):
        # 1. Buscar usuario por email
        row = self.cursor.execute("""
            SELECT id_usuario, password_hash, activo
            FROM usuario
            WHERE email = ?
        """, (email,)).fetchone()

        if not row:
            raise ValueError(f"El usuario con el mail '{email}' no fue encontrado")

        id_usuario, password_hash, activo = row

        if not activo:
            raise ValueError("El usuario está desactivado")

        # 2. Validar contraseña
        if not verify_password(password, password_hash):
            raise ValueError("Contraseña incorrecta")

        # 3. Obtener rol completo por nombre
        rol_completo = self.rol_service.get_by_name(rol)
        if not rol_completo:
            raise ValueError(f"Rol '{rol}' no existe")

        # 4. Verificar que el usuario tenga asignado ese rol
        row_ur = self.cursor.execute("""
            SELECT id_usuario, id_rol
            FROM usuarioRol
            WHERE id_usuario = ? AND id_rol = ?
        """, (id_usuario, rol_completo.id_rol)).fetchone()

        if not row_ur:
            raise ValueError(f"El usuario no tiene asignado el rol '{rol}'")

        # 5. Obtener usuario completo desde UsuarioService
        usuario = self.usuario_service.get_by_id(id_usuario)

        # 6. Construir respuesta
        return UsuarioRolResponse(
            id_usuario=id_usuario,
            id_rol=rol_completo.id_rol,
            usuario=usuario,
            rol=rol_completo
        )

    def change_password(self, id_usuario: int, current_password: str, new_password: str):
        row = self.cursor.execute("""
            SELECT password_hash
            FROM usuario
            WHERE id_usuario = ?
        """, (id_usuario,)).fetchone()

        if not row:
            raise ValueError("Usuario no encontrado")

        password_hash = row[0]

        if not verify_password(current_password, password_hash):
            raise ValueError("La contraseña actual es incorrecta")

        new_hash = hash_password(new_password)

        self.cursor.execute("""
            UPDATE usuario
            SET password_hash = ?
            WHERE id_usuario = ?
        """, (new_hash, id_usuario))

        self.db.commit()

        return {"message": "Contraseña actualizada exitosamente"}


    def recover_password(self, email: str):
        row = self.cursor.execute("""
            SELECT id_usuario
            FROM usuario
            WHERE email = ?
        """, (email,)).fetchone()

        if not row:
            raise ValueError("El email no está registrado")

        id_usuario = row[0]

        # Generar contraseña temporal
        temp_password = secrets.token_urlsafe(8)
        password_hash = hash_password(temp_password)

        self.cursor.execute("""
            UPDATE usuario
            SET password_hash = ?
            WHERE id_usuario = ?
        """, (password_hash, id_usuario))
        self.db.commit()

        # Enviar email
        cuerpo = f"""
Hola,
Se ha solicitado la recuperación de tu contraseña en Turnero Vitalis.
Tu nueva contraseña temporal es:
    {temp_password}
Por seguridad, te recomendamos cambiarla apenas inicies sesión.
Si no solicitaste este cambio, por favor ignora este correo.
Saludos,
Equipo Turnero Vitalis
"""

        success = EmailSender.send_email(
            destinatario=email,
            asunto="Recuperación de contraseña - Turnero Vitalis",
            cuerpo=cuerpo
        )

        if not success:
            raise ValueError("No se pudo enviar el correo")

        return {"message": "Se ha enviado una contraseña temporal a tu correo"}