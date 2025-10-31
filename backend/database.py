"""
Módulo de conexión a la base de datos.
Implementa un singleton para la conexión SQLite.
"""
import sqlite3
from typing import Optional
from config import get_settings


class DatabaseConnection:
    """
    Singleton para la conexión a la base de datos SQLite.
    Garantiza que solo exista una conexión compartida en toda la aplicación.
    """
    _instance: Optional['DatabaseConnection'] = None
    _connection: Optional[sqlite3.Connection] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        """Inicializa la conexión si aún no existe"""
        if self._connection is None:
            settings = get_settings()
            # Extraer la ruta del archivo de la URL
            db_path = settings.database_url.replace("sqlite:///", "")
            self._connection = sqlite3.connect(
                db_path,
                check_same_thread=False  # Importante para FastAPI
            )
            self._connection.row_factory = sqlite3.Row  # Permite acceso por nombre de columna
            print(f"✅ Conexión a base de datos establecida: {db_path}")

    @classmethod
    def get_connection(cls) -> sqlite3.Connection:
        """
        Retorna la conexión singleton a la base de datos.
        
        Returns:
            sqlite3.Connection: Conexión activa a la base de datos
        """
        if cls._instance is None:
            cls()
        return cls._instance._connection

    @classmethod
    def get_cursor(cls) -> sqlite3.Cursor:
        """
        Retorna un cursor para ejecutar consultas.
        
        Returns:
            sqlite3.Cursor: Cursor de la base de datos
        """
        return cls.get_connection().cursor()

    @classmethod
    def commit(cls):
        """Confirma los cambios en la base de datos"""
        cls.get_connection().commit()

    @classmethod
    def rollback(cls):
        """Revierte los cambios en la base de datos"""
        cls.get_connection().rollback()

    @classmethod
    def close(cls):
        """Cierra la conexión a la base de datos"""
        if cls._connection is not None:
            cls._connection.close()
            cls._connection = None
            print("🔒 Conexión a base de datos cerrada")

    def __enter__(self):
        """Context manager: entrada"""
        return self.get_connection()

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager: salida"""
        if exc_type is not None:
            self.rollback()
        else:
            self.commit()


def get_db() -> sqlite3.Connection:
    """
    Dependency Injection para FastAPI.
    Retorna la conexión a la base de datos.
    """
    return DatabaseConnection.get_connection()

