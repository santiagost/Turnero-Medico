# AnalyticsService 
# aca se implementan las funciones de estadisticas y reportes del sistema


class AnalyticsService:
    def __init__(self, db_connection):
        self.db = db_connection
        self.cursor = self.db.cursor()
    

    def get_resumen_diario(self, fecha_hora_actual: str):
        """Resumen del día (Totales hoy). Devuelve Turnos totales, pacientes atendidos, cancelados, nuevos registros. hasta ese momento en ese dia"""
        
        summary = {}
        try:
            # 1. Total turnos hoy (Cualquier estado)
            self.cursor.execute("""
                SELECT COUNT(*) FROM Turno
                WHERE DATE(fecha_hora_inicio) = DATE(?)
            """, (fecha_hora_actual,))
            summary['total_turnos'] = self.cursor.fetchone()[0]

            # 2. Turnos atendidos (Estado = 'Atendido' o 'Realizado')
            # Usamos subquery para no depender del ID numérico fijo
            self.cursor.execute("""
                SELECT COUNT(*) FROM Turno
                WHERE DATE(fecha_hora_inicio) = DATE(?)
                AND id_estado_turno = 2
            """, (fecha_hora_actual,))
            summary['turnos_atendidos'] = self.cursor.fetchone()[0]

            # 3. Turnos cancelados (Estado = 'Cancelado')
            self.cursor.execute("""
                SELECT COUNT(*) FROM Turno
                WHERE DATE(fecha_hora_inicio) = DATE(?)
                AND id_estado_turno = 3
            """, (fecha_hora_actual,))
            summary['turnos_cancelados'] = self.cursor.fetchone()[0]

            # 4. Turnos pendientes (Estado = 'Pendiente')
            self.cursor.execute("""
                SELECT COUNT(*) FROM Turno
                WHERE DATE(fecha_hora_inicio) = DATE(?)
                AND id_estado_turno = 1
            """, (fecha_hora_actual,))
            summary['turnos_pendientes'] = self.cursor.fetchone()[0]

            # 5. Turnos ausentes (Estado = 'Ausente')
            self.cursor.execute("""
                SELECT COUNT(*) FROM Turno
                WHERE DATE(fecha_hora_inicio) = DATE(?)
                AND id_estado_turno = 4
            """, (fecha_hora_actual,))
            summary['turnos_ausentes'] = self.cursor.fetchone()[0]

            # 6. Pacientes Atendidos (Estado = 'Atendido' o 'Realizado')
            # Usamos subquery para no depender del ID numérico fijo
            self.cursor.execute("""
                SELECT COUNT(DISTINCT id_paciente) FROM Turno
                WHERE DATE(fecha_hora_inicio) = DATE(?)
                AND id_estado_turno = 2
            """, (fecha_hora_actual,))
            summary['pacientes_atendidos'] = self.cursor.fetchone()[0]

            return summary

        except Exception as e:
            raise e


    # GET /estadisticas/turnos_por_especialidad - Turnos por especialidad.
    def get_turnos_por_especialidad(self, fecha_desde: str, fecha_hasta: str):

        """Turnos por especialidad entre dos fechas."""
        try:
            self.cursor.execute("""
                SELECT E.nombre AS especialidad, COUNT(T.id_turno) AS total_turnos
                FROM Turno T
                JOIN Medico M ON T.id_medico = M.id_medico
                JOIN Especialidad E ON M.id_especialidad = E.id_especialidad
                WHERE DATE(T.fecha_hora_inicio) BETWEEN DATE(?) AND DATE(?)
                GROUP BY E.nombre
            """, (fecha_desde, fecha_hasta))
            results = self.cursor.fetchall()

            stats = []
            for row in results:
                stats.append({
                    "especialidad": row[0],
                    "total_turnos": row[1]
                })

            return stats

        except Exception as e:
            raise e
        
    def get_rendimiento_medico(self, fecha_desde: str, fecha_hasta: str, id_medico: int = None):
        """Devuelve una lista de turnos para un médico"""
        print("Obteniendo rendimiento médico entre", fecha_desde, "y", fecha_hasta)
        
        try:
            # 1. BORRAMOS EL 'ORDER BY' DE AQUÍ PARA PONERLO AL FINAL
            query = """
                SELECT 
                    T.id_turno, 
                    DATE(T.fecha_hora_inicio) AS fecha, 
                    TIME(T.fecha_hora_inicio) AS hora,
                    P.apellido || ', ' || P.nombre AS paciente,
                    OS.nombre AS obra_social,
                    ET.nombre AS estado
                FROM Turno T
                JOIN Paciente P ON T.id_paciente = P.id_paciente
                LEFT JOIN ObraSocial OS ON P.id_obra_social = OS.id_obra_social 
                JOIN EstadoTurno ET ON T.id_estado_turno = ET.id_estado_turno
                WHERE DATE(T.fecha_hora_inicio) BETWEEN DATE(?) AND DATE(?)
            """

            params = [fecha_desde, fecha_hasta]

            # 2. Agregamos el filtro opcional ANTES del ORDER BY
            if id_medico is not None:
                query += " AND T.id_medico = ?"
                params.append(id_medico)

            # 3. Ahora sí, ponemos el ORDER BY al final de todo
            query += " ORDER BY T.fecha_hora_inicio ASC"

            self.cursor.execute(query, tuple(params))
            results = self.cursor.fetchall()

            stats = []
            for row in results:
                stats.append({
                    "id_turno": row[0],
                    "fecha": row[1],      # Antes pusiste fecha_hora_inicio, pero el SQL trae DATE
                    "hora": row[2],       # Antes pusiste fecha_hora_fin, pero el SQL trae TIME
                    "paciente": row[3],
                    # Manejo de nulos por si es Particular
                    "obra_social": row[4] if row[4] else "Particular",
                    "estado": row[5]
                })

            return stats
            
        except Exception as e:
            raise e
        
    
    def get_volumen_pacientes(self, fecha_desde: str, fecha_hasta: str):
        """Obtiene la evolución del volumen de pacientes ATENDIDOS en el tiempo"""
        try:
            self.cursor.execute("""
                SELECT DATE(fecha_hora_inicio) AS fecha, COUNT(DISTINCT id_paciente) AS total_pacientes
                FROM Turno
                WHERE DATE(fecha_hora_inicio) BETWEEN DATE(?) AND DATE(?)
                AND id_estado_turno = 2
                GROUP BY DATE(fecha_hora_inicio)
                ORDER BY DATE(fecha_hora_inicio) ASC
            """, (fecha_desde, fecha_hasta))
            results = self.cursor.fetchall()

            stats = []
            for row in results:
                dateLabel = row[0][8:10] + "/" + row[0][5:7]  # Formato DD/MM
                stats.append({
                    "dateFull": row[0],
                    "dateLabel": dateLabel,
                    "pacientes": row[1]
                })

            return stats

        except Exception as e:
            raise e
        
    
