# AnalyticsService 
# aca se implementan las funciones de estadisticas y reportes del sistema


class AnalyticsService:
    def __init__(self, db_connection):
        self.db = db_connection
        self.cursor = self.db.cursor()
    

    def get_daily_summary(self, fecha_hora_actual: str):
        """Resumen del día (Totales hoy). Devuelve Turnos totales, pacientes atendidos, cancelados, nuevos registros. hasta ese momento en ese dia"""
        
        summary = {}
        try:
            # 1. Total turnos hoy (Cualquier estado)
            self.cursor.execute("""
                SELECT COUNT(*) FROM Turno
                WHERE DATE(fecha_hora_inicio) = DATE(?)
            """, (fecha_hora_actual,))
            summary['total_turnos'] = self.cursor.fetchone()[0]

            # 2. Pacientes atendidos (Estado = 'Atendido' o 'Realizado')
            # Usamos subquery para no depender del ID numérico fijo
            self.cursor.execute("""
                SELECT COUNT(DISTINCT id_paciente) FROM Turno
                WHERE DATE(fecha_hora_inicio) = DATE(?)
                AND id_estado_turno = (SELECT id_estado_turno FROM EstadoTurno WHERE nombre = 'Atendido')
            """, (fecha_hora_actual,))
            summary['pacientes_atendidos'] = self.cursor.fetchone()[0]

            # 3. Turnos cancelados (Estado = 'Cancelado')
            self.cursor.execute("""
                SELECT COUNT(*) FROM Turno
                WHERE DATE(fecha_hora_inicio) = DATE(?)
                AND id_estado_turno = (SELECT id_estado_turno FROM EstadoTurno WHERE nombre = 'Cancelado')
            """, (fecha_hora_actual,))
            summary['turnos_cancelados'] = self.cursor.fetchone()[0]

            # 4. Turnos pendientes (Estado = 'Pendiente')
            self.cursor.execute("""
                SELECT COUNT(*) FROM Turno
                WHERE DATE(fecha_hora_inicio) = DATE(?)
                AND id_estado_turno = (SELECT id_estado_turno FROM EstadoTurno WHERE nombre = 'Pendiente')
            """, (fecha_hora_actual,))
            summary['turnos_pendientes'] = self.cursor.fetchone()[0]

            return summary

        except Exception as e:
            raise e

    
