
import sqlite3
from typing import List, Optional
from models.obraSocial import ObraSocialResponse, ObraSocialCreate, ObraSocialUpdate

class ObraSocialService:
    def __init__(self, db: sqlite3.Connection):
        self.db = db
        self.cursor = db.cursor()

    def _get_obra_social_completa(self, obra_social_id: int) -> Optional[ObraSocialResponse]:
        """Obtiene una obra social completa por ID"""
        self.cursor.execute("SELECT * FROM obrasocial WHERE id_obra_social = ?", (obra_social_id,))
        row = self.cursor.fetchone()
        if not row:
            return None
        
        obra_social_dict = dict(row)
        return ObraSocialResponse(
            id_obra_social=obra_social_dict['id_obra_social'],
            nombre=obra_social_dict['nombre'],
            cuit= obra_social_dict['cuit'],
            direccion= obra_social_dict['direccion'],
            telefono= obra_social_dict['telefono'],
            mail= obra_social_dict['mail']
        )
    
    def get_all(self) -> List[ObraSocialResponse]:
        """Obtiene todas las obras sociales"""
        self.cursor.execute("SELECT * FROM obrasocial")
        rows = self.cursor.fetchall()
        obras_sociales = []
        for row in rows:
            obra_social_id = dict(row)['id_obra_social']
            obra_social_completa = self._get_obra_social_completa(obra_social_id)
            if obra_social_completa:
                obras_sociales.append(obra_social_completa)
        return obras_sociales
    
    def get_by_id(self, obra_social_id: int) -> Optional[ObraSocialResponse]:
        """Obtiene una obra social por su ID"""
        return self._get_obra_social_completa(obra_social_id)
    
    def get_ligero(self) -> List[dict]:
        """Obtiene una lista ligera de obras sociales (id y nombre)"""
        self.cursor.execute("SELECT id_obra_social, nombre FROM obrasocial")
        rows = self.cursor.fetchall()
        ligero_list = []
        for row in rows:
            row_dict = dict(row)
            ligero_list.append({
                "id_obra_social": row_dict['id_obra_social'],
                "nombre": row_dict['nombre']
            })
        return ligero_list
    
    def create(self, obra_social_data: ObraSocialCreate) -> ObraSocialResponse:
        """Crea una nueva obra social"""
        try:
            self.cursor.execute("""
                INSERT INTO obrasocial (nombre, cuit, direccion, telefono, mail)
                VALUES (?, ?, ?, ?, ?)
            """, (
                obra_social_data.nombre,
                obra_social_data.cuit,
                obra_social_data.direccion,
                obra_social_data.telefono,
                obra_social_data.mail
            ))
            
            self.db.commit()
            
            # Obtener la obra social recién creada
            obra_social_id = self.cursor.lastrowid
            return self._get_obra_social_completa(obra_social_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al crear la obra social: " + str(e))
        
    
    def update(self, obra_social_id: int,
               nombre: Optional[str],
               cuit: Optional[str],
               direccion: Optional[str],
               telefono: Optional[str],
               mail: Optional[str]) -> Optional[ObraSocialResponse]:
        """Actualiza los datos de una obra social existente"""
        existing = self.get_by_id(obra_social_id)
        if not existing:
            return None
        
        try:
            updated_nombre = nombre if nombre is not None else existing.nombre
            updated_cuit = cuit if cuit is not None else existing.cuit
            updated_direccion = direccion if direccion is not None else existing.direccion
            updated_telefono = telefono if telefono is not None else existing.telefono
            updated_mail = mail if mail is not None else existing.mail
            
            # Ejecutar update
            self.cursor.execute("""
                UPDATE obrasocial
                SET nombre = ?, cuit = ?, direccion = ?, telefono = ?, mail = ?
                WHERE id_obra_social = ?
            """, (
                updated_nombre,
                updated_cuit,
                updated_direccion,
                updated_telefono,
                updated_mail,
                obra_social_id
            ))
            
            self.db.commit()
            
            return self._get_obra_social_completa(obra_social_id)
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al actualizar la obra social: " + str(e))
    
    def delete(self, obra_social_id: int) -> bool:
        """Elimina una obra social por su ID"""
        existing = self.get_by_id(obra_social_id)
        if not existing:
            return False
        
        try:
            self.cursor.execute("DELETE FROM obrasocial WHERE id_obra_social = ?", (obra_social_id,))
            self.db.commit()
            return True
            
        except sqlite3.IntegrityError as e:
            self.db.rollback()
            raise ValueError("Error al eliminar la obra social: " + str(e))
        


    
    
    