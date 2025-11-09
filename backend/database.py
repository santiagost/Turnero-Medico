"""
Singleton para la conexión con la base de datos SQLite.
"""
import sqlite3
from typing import Optional
from pathlib import Path

# Obtener la ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_DIR = BASE_DIR / "database"
database_url: Path = DATABASE_DIR / "turnero_medico.db"


class DatabaseConnection:
    _instance: Optional['DatabaseConnection'] = None
    _connection: Optional[sqlite3.Connection] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        """Inicializa la conexión si aún no existe"""
        if self._connection is None:
            self._connection = sqlite3.connect(
                str(database_url),
                check_same_thread=False
            )
            self._connection.row_factory = sqlite3.Row  # Permite acceso por nombre de columna
            print(f"✅ Conexión a base de datos establecida: {database_url}")

    @classmethod
    def get_connection(cls) -> sqlite3.Connection:
        """
        Retorna la conexión singleton a la base de datos.
        
        sqlite3.Connection: Conexión activa a la base de datos
        """
        if cls._instance is None:
            cls()
        return cls._instance._connection

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

    def __exit__(self, exc_type):
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

