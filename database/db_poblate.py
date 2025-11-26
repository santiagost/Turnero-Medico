import os
import sqlite3
import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "turnero_medico.db")

# --- FECHAS DINÁMICAS ---
today = datetime.date.today()
d_minus_5 = (today - datetime.timedelta(days=5)).isoformat()
d_minus_4 = (today - datetime.timedelta(days=4)).isoformat()
d_minus_3 = (today - datetime.timedelta(days=3)).isoformat()
d_minus_2 = (today - datetime.timedelta(days=2)).isoformat()
d_minus_1 = (today - datetime.timedelta(days=1)).isoformat()
hoy = today.isoformat()
manana = (today + datetime.timedelta(days=1)).isoformat()
pasado = (today + datetime.timedelta(days=2)).isoformat()

# Construimos el Script SQL
SQL_DATA = f"""

-- 1. LIMPIEZA
PRAGMA foreign_keys = OFF;
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
PRAGMA foreign_keys = ON;

-- =================================================================================================
-- Roles
INSERT INTO Rol (nombre, descripcion) VALUES
('Secretario', 'Acceso total al sistema'),
('Medico', 'Profesional de la salud con agenda'),
('Paciente', 'Usuario que solicita turnos');

-- =================================================================================================
-- Estados de Turno
INSERT INTO EstadoTurno (nombre, descripcion) VALUES
('Pendiente', 'Turno reservado'), -- ID 1
('Atendido', 'Turno finalizado'), -- ID 2
('Cancelado', 'Turno anulado'),   -- ID 3
('Ausente', 'Paciente no vino');  -- ID 4

-- =================================================================================================
-- Especialidades (IDs: 1=Cardio, 2=Pediatria, 3=Derma, 4=Clinica)
INSERT INTO Especialidad (nombre, descripcion) VALUES
('Cardiología', 'Corazón'),
('Pediatría', 'Niños'),
('Dermatología', 'Piel'),
('Clínica Médica', 'General');

-- =================================================================================================
-- Obras Sociales
INSERT INTO ObraSocial (nombre, cuit, direccion, telefono, mail) VALUES
('OSDE', '30-54678923-1', 'Av. Madero 1020', '0810-555-6733', 'contacto@osde.com.ar'),
('Swiss Medical', '30-12345678-9', 'Pueyrredón 1500', '0810-444-7700', 'info@swiss.com'),
('Particular', NULL, NULL, NULL, NULL);

-- =================================================================================================
-- USUARIOS  (La contraseña es: 123)
INSERT INTO Usuario (email, password_hash, activo, recordatorios_activados) VALUES
('admin@turnero.com', '$2b$12$JRWeXGGLnY6xixy8JmrazeomyJ0rhC9KCub./99DkEdLfiER690oa', 1, 1),      -- ID 1
('house@hospital.com', '$2b$12$JRWeXGGLnY6xixy8JmrazeomyJ0rhC9KCub./99DkEdLfiER690oa', 1, 1),     -- ID 2 (Medico Cardio)
('meredith@hospital.com', '$2b$12$JRWeXGGLnY6xixy8JmrazeomyJ0rhC9KCub./99DkEdLfiER690oa', 1, 1),  -- ID 3 (Medico Clinica)
('leomessi@gmail.com', '$2b$12$JRWeXGGLnY6xixy8JmrazeomyJ0rhC9KCub./99DkEdLfiER690oa', 1, 1),     -- ID 4 (Paciente)
('fitopaez@rock.com', '$2b$12$JRWeXGGLnY6xixy8JmrazeomyJ0rhC9KCub./99DkEdLfiER690oa', 1, 1),      -- ID 5 (Paciente)
('facu.witt@gmail.com', '$2b$12$JRWeXGGLnY6xixy8JmrazeomyJ0rhC9KCub./99DkEdLfiER690oa', 1, 1),    -- ID 6 (Paciente)
('jeremias@doc.com', '$2b$12$JRWeXGGLnY6xixy8JmrazeomyJ0rhC9KCub./99DkEdLfiER690oa', 1, 1),       -- ID 7 (Medico Pediatria)
('pimple@doc.com', '$2b$12$JRWeXGGLnY6xixy8JmrazeomyJ0rhC9KCub./99DkEdLfiER690oa', 1, 1);         -- ID 8 (Medico Dermatologia - NUEVO)

-- =================================================================================================
-- Asignar Roles
INSERT INTO UsuarioRol (id_usuario, id_rol) VALUES 
(1, 1), -- Admin
(2, 2), -- House (Med)
(3, 2), -- Meredith (Med)
(4, 3), -- Messi (Pac)
(5, 3), -- Fito (Pac)
(6, 3), -- Facu (Pac)
(7, 2), -- Jeremias (Med)
(8, 2); -- Pimple (Med)

-- =================================================================================================
-- MÉDICOS (Aquí está la clave para tu gráfico: Diversidad de Especialidades)

-- Medico 1: House -> Especialidad 1 (Cardiología)
INSERT INTO Medico (id_usuario, id_especialidad, matricula, dni, nombre, apellido, telefono, noti_cancel_email_act) VALUES 
(2, 1, 'MN-555444', '20123456', 'Gregory', 'House', '11-4444-5555', 1);

-- Medico 2: Meredith -> Especialidad 4 (Clínica Médica)
INSERT INTO Medico (id_usuario, id_especialidad, matricula, dni, nombre, apellido, telefono, noti_cancel_email_act) VALUES 
(3, 4, 'MN-111222', '28987654', 'Meredith', 'Grey', '11-9999-8888', 1);

-- Medico 3: Jeremias -> Especialidad 2 (Pediatría) - CAMBIADO para dar variedad
INSERT INTO Medico (id_usuario, id_especialidad, matricula, dni, nombre, apellido, telefono, noti_cancel_email_act) VALUES 
(7, 2, 'MN-333444', '30765432', 'Jeremias', 'Springfield', '11-7777-6666', 1);

-- Medico 4: Dra Pimple -> Especialidad 3 (Dermatología) - NUEVO
INSERT INTO Medico (id_usuario, id_especialidad, matricula, dni, nombre, apellido, telefono, noti_cancel_email_act) VALUES 
(8, 3, 'MN-999888', '22333444', 'Sandra', 'Lee', '11-1234-5678', 1);

-- =================================================================================================
-- Pacientes
INSERT INTO Paciente (id_usuario, dni, nombre, apellido, fecha_nacimiento, telefono, id_obra_social, nro_afiliado, noti_reserva_email_act) VALUES
(4, '30001002', 'Lionel', 'Messi', '1987-06-24', '11-1010-1010', 1, 'OSDE-999111', 1),
(5, '14555666', 'Rodolfo', 'Paez', '1963-03-13', '11-2020-2020', 2, 'SM-777888', 1),
(6, '44806336', 'Facundo', 'Witt', '2003-07-04', '11-3030-3030', 3, 'P-123456', 1);

-- =================================================================================================
-- Horarios de Atención 
-- (Simplificados para que todos trabajen de Lunes a Viernes un rato)
INSERT INTO HorarioAtencion (id_medico, dia_semana, hora_inicio, hora_fin, duracion_turno_min) VALUES 
(1, 0, '08:00', '16:00', 30), (1, 1, '08:00', '16:00', 30), (1, 2, '08:00', '16:00', 30), -- House
(2, 0, '09:00', '15:00', 20), (2, 1, '09:00', '15:00', 20), (2, 2, '09:00', '15:00', 20), -- Meredith
(3, 0, '10:00', '18:00', 30), (3, 1, '10:00', '18:00', 30), (3, 2, '10:00', '18:00', 30), -- Jeremias
(4, 0, '08:00', '12:00', 15), (4, 1, '08:00', '12:00', 15), (4, 2, '08:00', '12:00', 15); -- Pimple

-- =================================================================================================
-- TURNOS (Distribuidos para generar estadísticas)
-- IDs Médicos: 1=Cardio, 2=Clinica, 3=Pediatria, 4=Dermatologia

INSERT INTO Turno (id_paciente, id_medico, id_estado_turno, fecha_hora_inicio, fecha_hora_fin, motivo_consulta, recordatorio_notificado, reserva_notificada) VALUES

-- --- HACE 5 DÍAS ---
-- 2 de Cardio (House)
(1, 1, 2, '{d_minus_5} 09:00:00', '{d_minus_5} 09:30:00', 'Presión Alta', 1, 1),
(2, 1, 2, '{d_minus_5} 09:30:00', '{d_minus_5} 10:00:00', 'Dolor pecho', 1, 1),
-- 1 de Dermatología (Lee)
(3, 4, 2, '{d_minus_5} 08:00:00', '{d_minus_5} 08:15:00', 'Acné', 1, 1),

-- --- HACE 4 DÍAS ---
-- 3 de Clinica (Meredith)
(1, 2, 2, '{d_minus_4} 10:00:00', '{d_minus_4} 10:20:00', 'Gripe', 1, 1),
(2, 2, 2, '{d_minus_4} 10:20:00', '{d_minus_4} 10:40:00', 'Fiebre', 1, 1),
(3, 2, 3, '{d_minus_4} 10:40:00', '{d_minus_4} 11:00:00', 'Cancelado', 1, 1),
-- 1 de Pediatria (Jeremias)
(1, 3, 2, '{d_minus_4} 15:00:00', '{d_minus_4} 15:30:00', 'Vacunación', 1, 1),

-- --- HACE 3 DÍAS (Día cargado) ---
-- 2 de Pediatría (Jeremias)
(2, 3, 2, '{d_minus_3} 16:00:00', '{d_minus_3} 16:30:00', 'Control niño', 1, 1),
(3, 3, 4, '{d_minus_3} 16:30:00', '{d_minus_3} 17:00:00', 'Ausente', 1, 1),
-- 2 de Dermatología (Lee)
(1, 4, 2, '{d_minus_3} 09:00:00', '{d_minus_3} 09:15:00', 'Lunar sospechoso', 1, 1),
(2, 4, 2, '{d_minus_3} 09:15:00', '{d_minus_3} 09:30:00', 'Eczema', 1, 1),
-- 1 de Cardio
(3, 1, 2, '{d_minus_3} 11:00:00', '{d_minus_3} 11:30:00', 'Arritmia', 1, 1),

-- --- HACE 2 DÍAS ---
-- Mix variado
(1, 2, 2, '{d_minus_2} 09:00:00', '{d_minus_2} 09:20:00', 'Clinica dolor', 1, 1),
(2, 4, 2, '{d_minus_2} 10:00:00', '{d_minus_2} 10:15:00', 'Dermatitis', 1, 1),
(3, 1, 2, '{d_minus_2} 14:00:00', '{d_minus_2} 14:30:00', 'Cardio chequeo', 1, 1),

-- --- HOY (Datos actuales) ---
(1, 2, 2, '{hoy} 09:00:00', '{hoy} 09:20:00', 'Dolor garganta', 0, 1),
(2, 3, 1, '{hoy} 17:00:00', '{hoy} 17:30:00', 'Fiebre niño (Pendiente)', 0, 1),
(3, 1, 1, '{hoy} 15:00:00', '{hoy} 15:30:00', 'Consulta Tarde (Pendiente)', 0, 1);

-- RESULTADO ESPERADO EN GRÁFICO (aprox en rango 5 dias):
-- Cardiología: ~5 turnos
-- Clínica: ~5 turnos
-- Dermatología: ~4 turnos
-- Pediatría: ~4 turnos
-- TOTAL: ~18 turnos bien distribuidos

-- =================================================================================================
-- Consultas (Para dar realismo)
INSERT INTO Consulta (id_turno, diagnostico, notas_privadas_medico, tratamiento, fecha_consulta) VALUES
(1, 'Hipertensión', 'Ok', 'Dieta', '{d_minus_5} 09:20:00'),
(3, 'Acné Vulgar', 'Adolescencia', 'Cremas', '{d_minus_5} 08:10:00');

"""

def poblar_db():
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        print("Iniciando población de base de datos...")
        cursor.executescript(SQL_DATA)
        conn.commit()
        print("✅ Base de datos poblada con éxito.")
        print("📊 Se generaron médicos de 4 especialidades diferentes para probar los gráficos.")
    except sqlite3.Error as e:
        print(f"❌ Error: {e}")
        if conn: conn.rollback()
    finally:
        if conn: conn.close()

if __name__ == "__main__":
    poblar_db()