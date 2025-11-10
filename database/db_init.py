import sqlite3

DB_FILE = "turnero_medico.db"

SQL_SCHEMA = """
-- Habilitar el soporte de claves foráneas (es necesario en SQLite)
PRAGMA foreign_keys = ON;

-- -----------------------------------------------------
-- Tabla: Usuario
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Usuario (
  id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  creado_en TEXT DEFAULT (CURRENT_TIMESTAMP),
  activo INTEGER DEFAULT 1
);

-- -----------------------------------------------------
-- Tabla: Rol
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Rol (
  id_rol INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT UNIQUE NOT NULL,
  descripcion TEXT
);

-- -----------------------------------------------------
-- Tabla: UsuarioRol (Tabla de unión)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS UsuarioRol (
  id_usuario INTEGER,
  id_rol INTEGER,
  PRIMARY KEY (id_usuario, id_rol),
  FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_rol) REFERENCES Rol(id_rol) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Tabla: ObraSocial
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS ObraSocial (
  id_obra_social INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT UNIQUE NOT NULL,
  cuit TEXT UNIQUE,
  direccion TEXT,
  telefono TEXT,
  mail TEXT UNIQUE
);

-- -----------------------------------------------------
-- Tabla: Paciente
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Paciente (
  id_paciente INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario INTEGER UNIQUE,
  dni TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  fecha_nacimiento TEXT,
  telefono TEXT,
  id_obra_social INTEGER,
  nro_afiliado TEXT,
  FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE SET NULL,
  FOREIGN KEY (id_obra_social) REFERENCES ObraSocial(id_obra_social) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Tabla: Especialidad
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Especialidad (
  id_especialidad INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT UNIQUE NOT NULL,
  descripcion TEXT
);

-- -----------------------------------------------------
-- Tabla: Medico
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Medico (
  id_medico INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario INTEGER UNIQUE NOT NULL,
  id_especialidad INTEGER NOT NULL,
  matricula TEXT UNIQUE NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT,
  FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
  FOREIGN KEY (id_especialidad) REFERENCES Especialidad(id_especialidad)
);

-- -----------------------------------------------------
-- Tabla: HorarioAtencion
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS HorarioAtencion (
  id_horario_atencion INTEGER PRIMARY KEY AUTOINCREMENT,
  id_medico INTEGER NOT NULL,
  dia_semana INTEGER NOT NULL,
  hora_inicio TEXT NOT NULL,
  hora_fin TEXT NOT NULL,
  duracion_turno_min INTEGER NOT NULL DEFAULT 30,
  FOREIGN KEY (id_medico) REFERENCES Medico(id_medico) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Tabla: EstadoTurno
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS EstadoTurno (
  id_estado_turno INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT UNIQUE NOT NULL,
  descripcion TEXT
);

-- -----------------------------------------------------
-- Tabla: Turno
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Turno (
  id_turno INTEGER PRIMARY KEY AUTOINCREMENT,
  id_paciente INTEGER NOT NULL,
  id_medico INTEGER NOT NULL,
  id_estado_turno INTEGER NOT NULL DEFAULT 1,
  fecha_hora_inicio TEXT NOT NULL,
  fecha_hora_fin TEXT NOT NULL,
  motivo_consulta TEXT,
  FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente),
  FOREIGN KEY (id_medico) REFERENCES Medico(id_medico),
  FOREIGN KEY (id_estado_turno) REFERENCES EstadoTurno(id_estado_turno)
);

-- -----------------------------------------------------
-- Tabla: Consulta
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Consulta (
  id_consulta INTEGER PRIMARY KEY AUTOINCREMENT,
  id_turno INTEGER UNIQUE NOT NULL,
  diagnostico TEXT,
  notas_privadas_medico TEXT,
  tratamiento TEXT,
  fecha_consulta TEXT NOT NULL,
  FOREIGN KEY (id_turno) REFERENCES Turno(id_turno)
);

-- -----------------------------------------------------
-- Tabla: Receta
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Receta (
  id_receta INTEGER PRIMARY KEY AUTOINCREMENT,
  id_consulta INTEGER NOT NULL,
  medicamento TEXT NOT NULL,
  dosis TEXT,
  instrucciones TEXT,
  fecha_emision TEXT NOT NULL,
  FOREIGN KEY (id_consulta) REFERENCES Consulta(id_consulta)
);

-- -----------------------------------------------------
-- Índices
-- -----------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_turno_medico_fecha
ON Turno (id_medico, fecha_hora_inicio);
"""

def crear_base_de_datos():
    """
    Crea la base de datos y las tablas desde cero.
    """
    conn = None
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        
        cursor.executescript(SQL_SCHEMA)
        
        conn.commit()
        print(f"Base de datos '{DB_FILE}' creada exitosamente con todas las tablas.")
        
    except sqlite3.Error as e:
        print(f"Error al crear la base de datos: {e}")
        if conn:
            conn.rollback()  
            
    finally:
        if conn:
            conn.close() 

if __name__ == "__main__":
    crear_base_de_datos()