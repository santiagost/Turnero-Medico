import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "turnero_medico.db")


SQL_DATA = """

-- 1. LIMPIEZA (Opcional: Borrar datos viejos si quieres reiniciar IDs)
DELETE FROM Receta;
DELETE FROM Consulta;
DELETE FROM Turno;
DELETE FROM HorarioAtencion;
DELETE FROM Medico;
DELETE FROM Paciente;
DELETE FROM UsuarioRol;
DELETE FROM Usuario;
DELETE FROM ObraSocial;
DELETE FROM Especialidad;
DELETE FROM EstadoTurno;
DELETE FROM Rol;
DELETE FROM sqlite_sequence;

-- 2. INSERCIÓN DE CATÁLOGOS (Datos fijos)

-- Roles
INSERT INTO Rol (nombre, descripcion) VALUES
('Secretario', 'Acceso total al sistema'),
('Medico', 'Profesional de la salud con agenda'),
('Paciente', 'Usuario que solicita turnos');

-- Estados de Turno
INSERT INTO EstadoTurno (nombre, descripcion) VALUES 
('Pendiente', 'Turno reservado, a la espera de confirmación o llegada'),
('Confirmado', 'El paciente ha confirmado asistencia'),
('Cancelado', 'Turno anulado por medico o paciente'),
('Realizado', 'La consulta se ha llevado a cabo');

-- Especialidades
INSERT INTO Especialidad (nombre, descripcion) VALUES 
('Cardiología', 'Enfermedades del corazón y sistema circulatorio'),
('Pediatría', 'Atención médica de bebés, niños y adolescentes'),
('Dermatología', 'Cuidado de la piel'),
('Clínica Médica', 'Atención primaria general');

-- Obras Sociales
INSERT INTO ObraSocial (nombre, cuit, direccion, telefono, mail) VALUES 
('OSDE', '30-54678923-1', 'Av. Madero 1020', '0810-555-6733', 'contacto@osde.com.ar'),
('Swiss Medical', '30-12345678-9', 'Pueyrredón 1500', '0810-444-7700', 'info@swiss.com'),
('Particular', NULL, NULL, NULL, NULL);

-- 3. USUARIOS (Contraseñas simuladas como hashes)
-- IDs esperados: 1=Admin, 2=DrHouse, 3=DraGrey, 4=Messi(Pac), 5=Fito(Pac)

INSERT INTO Usuario (email, password_hash, activo) VALUES 
('admin@turnero.com', 'hash_secreto_admin_123', 1),           -- ID 1
('house@hospital.com', 'hash_secreto_house', 1),              -- ID 2
('meredith@hospital.com', 'hash_secreto_grey', 1),            -- ID 3
('leomessi@gmail.com', 'hash_secreto_leo', 1),                -- ID 4
('fitopaez@rock.com', 'hash_secreto_fito', 1);                -- ID 5

-- Asignar Roles (UsuarioRol)
INSERT INTO UsuarioRol (id_usuario, id_rol) VALUES 
(1, 1), -- Admin es Admin
(2, 2), -- House es Medico
(3, 2), -- Meredith es Medico
(4, 3), -- Leo es Paciente
(5, 3); -- Fito es Paciente

-- 4. ENTIDADES PRINCIPALES

-- Médicos
-- Dr. House (ID Usr 2) -> Cardiología (ID Esp 1)
INSERT INTO Medico (id_usuario, id_especialidad, matricula, dni, nombre, apellido, telefono) VALUES 
(2, 1, 'MN-555444', '20123456', 'Gregory', 'House', '11-4444-5555'),
-- Dra. Grey (ID Usr 3) -> Clínica Médica (ID Esp 4)
(3, 4, 'MN-111222', '28987654', 'Meredith', 'Grey', '11-9999-8888');

-- Pacientes
-- Messi (ID Usr 4) -> OSDE (ID OS 1)
INSERT INTO Paciente (id_usuario, dni, nombre, apellido, fecha_nacimiento, telefono, id_obra_social, nro_afiliado) VALUES 
(4, '30001002', 'Lionel', 'Messi', '1987-06-24', '11-1010-1010', 1, 'OSDE-999111'),
-- Fito (ID Usr 5) -> Swiss Medical (ID OS 2)
(5, '14555666', 'Rodolfo', 'Paez', '1963-03-13', '11-2020-2020', 2, 'SM-777888');

-- 5. OPERATIVA

-- Horarios de Atención
-- House atiende Lunes (Día 0 o 1 según criterio, usaremos 0=Lunes) de 8 a 12
INSERT INTO HorarioAtencion (id_medico, dia_semana, hora_inicio, hora_fin, duracion_turno_min) VALUES 
(1, 0, '08:00', '12:00', 30), -- House Lunes
(1, 2, '14:00', '18:00', 30), -- House Miércoles
(2, 1, '09:00', '17:00', 20); -- Grey Martes (turnos de 20 min)

-- Turnos
-- Turno 1: Messi con House (Pasado y Realizado)
INSERT INTO Turno (id_paciente, id_medico, id_estado_turno, fecha_hora_inicio, fecha_hora_fin, motivo_consulta) VALUES 
(1, 1, 4, '2024-01-10 09:00:00', '2024-01-10 09:30:00', 'Dolor en la pierna izquierda'),
-- Turno 2: Fito con Grey (Futuro y Pendiente)
(2, 2, 1, '2024-12-25 10:00:00', '2024-12-25 10:20:00', 'Chequeo general de garganta');

-- Consultas (Solo para el turno realizado)
INSERT INTO Consulta (id_turno, diagnostico, notas_privadas_medico, tratamiento, fecha_consulta) VALUES 
(1, 'Contractura muscular leve', 'El paciente refiere mucho entrenamiento', 'Reposo y kinesiología', '2024-01-10 09:25:00');

-- Recetas (Para la consulta anterior)
INSERT INTO Receta (id_consulta, medicamento, dosis, instrucciones, fecha_emision) VALUES 
(1, 'Diclofenac', '75mg', 'Uno cada 12 horas si hay dolor', '2024-01-10');


"""

def poblar_db():
    """
    Inserta datos iniciales en la base de datos.
    """
    try:
        conn = sqlite3.connect(DB_FILE)
        # IMPORTANTE: Activar Foreign Keys para que SQLite valide las relaciones
        conn.execute("PRAGMA foreign_keys = ON;")

        cursor = conn.cursor()

        # Ejecutamos el script
        cursor.executescript(SQL_DATA)

        conn.commit()
        print(f"Datos insertados exitosamente en '{DB_FILE}'.")
        print("   - Se crearon usuarios, medicos, pacientes y turnos de prueba.")

    except sqlite3.Error as e:
        print(f"Error al insertar datos: {e}")
        if conn:
            conn.rollback() 
        
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    poblar_db()