import os
import sqlite3
import datetime
import random

# --- CONFIGURACIÓN ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "turnero_medico.db")
PASSWORD_HASH = '$2b$12$JRWeXGGLnY6xixy8JmrazeomyJ0rhC9KCub./99DkEdLfiER690oa' # "123"

# --- DATOS DE REFERENCIA ---
ESPECIALIDADES = [
    ("Cardiología", "Corazón y sistema circulatorio"),
    ("Pediatría", "Atención médica de bebés, niños y adolescentes"),
    ("Dermatología", "Piel, cabello y uñas"),
    ("Clínica Médica", "Atención primaria general"),
    ("Traumatología", "Lesiones óseas y musculares"),
    ("Ginecología", "Salud integral de la mujer"),
    ("Neurología", "Sistema nervioso"),
    ("Oftalmología", "Salud visual"),
    ("Psiquiatría", "Salud mental"),
    ("Otorrinolaringología", "Oído, nariz y garganta")
]

OBRAS_SOCIALES = [
    ("OSDE", "30-54678923-1", "Av. Madero 1020"),
    ("Swiss Medical", "30-12345678-9", "Pueyrredón 1500"),
    ("Particular", None, None),
    ("Galeno", "30-55555555-5", "Av. Libertador 2000")
]

# (Nombre, Apellido, Especialidad_Index 0-9)
MEDICOS_DATA = [
    ("Gregory", "House", 3),      # Clinica
    ("Meredith", "Grey", 9),      # Cirugia/Clinica -> Otorrino (simulado)
    ("Derek", "Shepherd", 6),     # Neuro
    ("Shaun", "Murphy", 9),       # Cirugia -> Pediatria (simulado index 1)
    ("Stephen", "Strange", 6),    # Neuro
    ("Sandra", "Lee", 2),         # Derma
    ("Leonard", "McCoy", 0),      # Cardio
    ("Michaela", "Quinn", 3),     # Clinica
    ("Hannibal", "Lecter", 8),    # Psiquiatria
    ("Julius", "Hibbert", 1),     # Pediatria
]

PACIENTES_NOMBRES = ["Lionel", "Cristiano", "Neymar", "Kylian", "Luka", "Kevin", "Erling", "Robert", "Karim", "Mohamed", "Harry", "Sergio", "Thibaut", "Vinicius", "Rodri", "Sadio", "Bernardo", "Ruben", "Phil", "Jude"]
PACIENTES_APELLIDOS = ["Messi", "Ronaldo", "Junior", "Mbappe", "Modric", "DeBruyne", "Haaland", "Lewandowski", "Benzema", "Salah", "Kane", "Ramos", "Courtois", "Pele", "Hernandez", "Mane", "Silva", "Dias", "Foden", "Bellingham"]

DIAGNOSTICOS = [
    "Gripe Estacional", "Hipertensión Arterial", "Dermatitis Atópica", "Migraña Crónica", 
    "Esguince de Tobillo", "Control de Niño Sano", "Ansiedad Generalizada", "Conjuntivitis Bacteriana",
    "Otitis Media", "Lumbalgia", "Gastritis Aguda", "Fractura de Radio", "Chequeo General",
    "Acné Vulgar", "Insomnio"
]

MEDICAMENTOS = [
    ("Ibuprofeno 600mg", "1 comprimido cada 8hs"),
    ("Paracetamol 1g", "1 comprimido cada 12hs si hay dolor"),
    ("Amoxicilina 500mg", "1 comprimido cada 8hs por 7 días"),
    ("Enalapril 10mg", "1 comprimido por la mañana"),
    ("Clonazepam 0.5mg", "1 comprimido por la noche"),
    ("Omeprazol 20mg", "1 cápsula en ayunas"),
    ("Loratadina 10mg", "1 comprimido por día"),
    ("Crema Betametasona", "Aplicar en zona afectada 2 veces al día"),
    ("Salbutamol Aerosol", "2 disparos ante falta de aire"),
    ("Diclofenac 75mg", "1 inyectable por única vez")
]

# --- FUNCIONES ---

def get_db():
    return sqlite3.connect(DB_FILE)

def limpiar_base(cursor):
    tables = ["Receta", "Consulta", "Turno", "HorarioAtencion", "Medico", "Paciente", "UsuarioRol", "Usuario", "ObraSocial", "Especialidad", "EstadoTurno", "Rol"]
    cursor.execute("PRAGMA foreign_keys = OFF;")
    for table in tables:
        cursor.execute(f"DELETE FROM {table};")
        cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}';")
    cursor.execute("PRAGMA foreign_keys = ON;")
    print("🧹 Base de datos limpiada.")

def poblar_catalogos(cursor):
    # Roles
    cursor.execute("INSERT INTO Rol (id_rol, nombre, descripcion) VALUES (1, 'Secretario', 'Total'), (2, 'Medico', 'Agenda'), (3, 'Paciente', 'Turnos')")
    # Estados
    cursor.execute("INSERT INTO EstadoTurno (id_estado_turno, nombre, descripcion) VALUES (1, 'Pendiente', 'Reservado'), (2, 'Atendido', 'Finalizado'), (3, 'Cancelado', 'Anulado'), (4, 'Ausente', 'No asistio')")
    # Especialidades
    cursor.executemany("INSERT INTO Especialidad (nombre, descripcion) VALUES (?, ?)", ESPECIALIDADES)
    # Obras Sociales
    cursor.executemany("INSERT INTO ObraSocial (nombre, cuit, direccion) VALUES (?, ?, ?)", OBRAS_SOCIALES)
    print("📋 Catálogos cargados.")

def poblar_usuarios_y_perfiles(cursor):
    # 1. Admin
    cursor.execute("INSERT INTO Usuario (email, password_hash, activo) VALUES (?, ?, 1)", ('admin@vitalis.com', PASSWORD_HASH))
    id_admin = cursor.lastrowid
    cursor.execute("INSERT INTO UsuarioRol (id_usuario, id_rol) VALUES (?, 1)", (id_admin,))

    # 2. Medicos
    ids_medicos = []
    for i, (nombre, apellido, esp_idx) in enumerate(MEDICOS_DATA):
        email = f"{nombre.lower()}.{apellido.lower()}@vitalis.com"
        cursor.execute("INSERT INTO Usuario (email, password_hash, activo) VALUES (?, ?, 1)", (email, PASSWORD_HASH))
        uid = cursor.lastrowid
        cursor.execute("INSERT INTO UsuarioRol (id_usuario, id_rol) VALUES (?, 2)", (uid,))
        
        # Crear perfil Medico
        matricula = f"MN-{random.randint(1000,9999)}"
        dni = str(random.randint(20000000, 40000000))
        # Especialidad ID es esp_idx + 1 (porque SQLite empieza en 1)
        cursor.execute("""
            INSERT INTO Medico (id_usuario, id_especialidad, matricula, dni, nombre, apellido, telefono, noti_cancel_email_act)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        """, (uid, esp_idx + 1, matricula, dni, nombre, apellido, f"11-{random.randint(1000,9999)}-{random.randint(1000,9999)}"))
        ids_medicos.append(cursor.lastrowid) # Guardamos el ID de la tabla MEDICO, no Usuario

    # 3. Pacientes
    ids_pacientes = []
    for _ in range(30):
        nombre = random.choice(PACIENTES_NOMBRES)
        apellido = random.choice(PACIENTES_APELLIDOS)
        email = f"{nombre.lower()}.{apellido.lower()}{random.randint(1,99)}@gmail.com"
        
        cursor.execute("INSERT INTO Usuario (email, password_hash, activo) VALUES (?, ?, 1)", (email, PASSWORD_HASH))
        uid = cursor.lastrowid
        cursor.execute("INSERT INTO UsuarioRol (id_usuario, id_rol) VALUES (?, 3)", (uid,))
        
        dni = str(random.randint(10000000, 99999999))
        id_os = random.randint(1, 4) # 4 Obras sociales
        nro_afiliado = f"AF-{random.randint(10000,99999)}" if id_os != 3 else None
        
        cursor.execute("""
            INSERT INTO Paciente (id_usuario, dni, nombre, apellido, fecha_nacimiento, telefono, id_obra_social, nro_afiliado, noti_reserva_email_act)
            VALUES (?, ?, ?, ?, '1980-01-01', ?, ?, ?, 1)
        """, (uid, dni, nombre, apellido, f"11-5555-{random.randint(1000,9999)}", id_os, nro_afiliado))
        ids_pacientes.append(cursor.lastrowid)

    print(f"👥 Usuarios creados: 1 Admin, {len(ids_medicos)} Médicos, {len(ids_pacientes)} Pacientes.")
    return ids_medicos, ids_pacientes

def generar_turnos_historia(cursor, ids_medicos, ids_pacientes):
    today = datetime.date.today()
    start_date = today - datetime.timedelta(days=30) # Un mes atrás
    end_date = today + datetime.timedelta(days=15)   # 15 días adelante
    
    total_turnos = 0
    total_consultas = 0
    total_recetas = 0

    # Días laborales (Lunes=0 a Viernes=4)
    delta_days = (end_date - start_date).days
    
    for i in range(delta_days + 1):
        current_date = start_date + datetime.timedelta(days=i)
        
        # Saltamos fines de semana para simplificar horarios
        if current_date.weekday() >= 5: continue 
        
        es_pasado = current_date < today
        
        for id_medico in ids_medicos:
            # Creamos Horario de Atencion para este médico (Simplificado: Todos de 9 a 17)
            # Solo lo insertamos una vez por médico por día de la semana (0-4)
            if i < 5: 
                # Solo insertamos la definicion del horario una vez (asumimos lógica simple aquí)
                cursor.execute("INSERT OR IGNORE INTO HorarioAtencion (id_medico, dia_semana, hora_inicio, hora_fin, duracion_turno_min) VALUES (?, ?, '09:00', '17:00', 30)", (id_medico, current_date.weekday()))

            # Generar entre 2 y 8 turnos por día por médico
            cant_turnos = random.randint(2, 8)
            horas_posibles = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"]
            
            random.shuffle(horas_posibles)
            horas_seleccionadas = horas_posibles[:cant_turnos]

            for hora in horas_seleccionadas:
                id_paciente = random.choice(ids_pacientes)
                
                # Definir estado del turno
                if es_pasado:
                    # Probabilidades: 70% Atendido, 15% Cancelado, 15% Ausente
                    rand = random.random()
                    if rand < 0.70: estado = 2 # Atendido
                    elif rand < 0.85: estado = 3 # Cancelado
                    else: estado = 4 # Ausente
                else:
                    # Futuro: 90% Pendiente, 10% Cancelado
                    estado = 1 if random.random() < 0.9 else 3

                fecha_inicio = f"{current_date.isoformat()} {hora}:00"
                # Calculo fin (30 min despues)
                dt_inicio = datetime.datetime.strptime(fecha_inicio, "%Y-%m-%d %H:%M:%S")
                dt_fin = dt_inicio + datetime.timedelta(minutes=30)
                fecha_fin = dt_fin.strftime("%Y-%m-%d %H:%M:%S")

                cursor.execute("""
                    INSERT INTO Turno (id_paciente, id_medico, id_estado_turno, fecha_hora_inicio, fecha_hora_fin, motivo_consulta, recordatorio_notificado, reserva_notificada)
                    VALUES (?, ?, ?, ?, ?, ?, 1, 1)
                """, (id_paciente, id_medico, estado, fecha_inicio, fecha_fin, "Consulta General"))
                
                id_turno = cursor.lastrowid
                total_turnos += 1

                # SI FUE ATENDIDO -> GENERAR CONSULTA
                if estado == 2:
                    diagnostico = random.choice(DIAGNOSTICOS)
                    notas = f"Paciente {random.choice(['estable', 'con dolor', 'mejora', 'empeora'])}. Se indica tratamiento."
                    tratamiento = "Reposo y medicación"
                    
                    cursor.execute("""
                        INSERT INTO Consulta (id_turno, diagnostico, notas_privadas_medico, tratamiento, fecha_consulta)
                        VALUES (?, ?, ?, ?, ?)
                    """, (id_turno, diagnostico, notas, tratamiento, fecha_inicio))
                    id_consulta = cursor.lastrowid
                    total_consultas += 1

                    # POSIBLEMENTE GENERAR RECETAS (0, 1 o 2)
                    cant_recetas = random.choices([0, 1, 2], weights=[20, 50, 30], k=1)[0]
                    for _ in range(cant_recetas):
                        med, instr = random.choice(MEDICAMENTOS)
                        cursor.execute("""
                            INSERT INTO Receta (id_consulta, medicamento, fecha_emision, dosis, instrucciones)
                            VALUES (?, ?, ?, ?, ?)
                        """, (id_consulta, med.split()[0], fecha_inicio, med.split()[1] if len(med.split())>1 else "1 comp", instr))
                        total_recetas += 1

    print(f"📅 Agenda generada: {total_turnos} Turnos, {total_consultas} Consultas, {total_recetas} Recetas.")

def main():
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        print("🚀 Iniciando script de población masiva...")
        
        limpiar_base(cursor)
        poblar_catalogos(cursor)
        ids_medicos, ids_pacientes = poblar_usuarios_y_perfiles(cursor)
        generar_turnos_historia(cursor, ids_medicos, ids_pacientes)
        
        conn.commit()
        print("\n✅ EXITO: Base de datos 'turnero_medico.db' poblada completamente.")
        print(f"   Ubicación: {DB_FILE}")
        
    except Exception as e:
        print(f"\n❌ ERROR CRÍTICO: {e}")
        if conn: conn.rollback()
    finally:
        if conn: conn.close()

if __name__ == "__main__":
    main()