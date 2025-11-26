import axiosClient from "./axiosClient";
import { 
  mapDailyStatsFromBackend, 
  mapMedicalPerformanceFromBackend, 
  mapChartDataFromBackend 
} from "../src/utils/mappers";

// Endpoint: GET /estadisticas/diarias
export const getDailySummary = async () => {
  try {
    const response = await axiosClient.get("/estadisticas/diarias");
    return mapDailyStatsFromBackend(response.data);
  } catch (error) {
    console.error("Error al obtener resumen diario:", error);
    throw error;
  }
};

// Endpoint: GET /estadisticas/volumen-pacientes
export const getPatientVolume = async (startDate, endDate) => {
  try {
    const response = await axiosClient.get("/estadisticas/volumen-pacientes", {
      params: {
        fecha_desde: startDate, // Formato YYYY-MM-DD
        fecha_hasta: endDate,
      },
    });
    // Asumimos que devuelve un array de datos para gráfico
    const data = response.data.map(mapChartDataFromBackend);
    return data;
  } catch (error) {
    console.error(`Error al obtener volumen de pacientes (${startDate} a ${endDate}):`, error);
    throw error;
  }
};

// Endpoint: GET /estadisticas/asistencia-vs-inasistencia
export const getAttendanceVsAbsence = async (startDate, endDate) => {
  try {
    const response = await axiosClient.get("/estadisticas/asistencia-vs-inasistencia", {
      params: {
        fecha_desde: startDate,
        fecha_hasta: endDate,
      },
    });
    return response.data.map(mapChartDataFromBackend);
  } catch (error) {
    console.error(`Error al obtener comparativa de asistencia (${startDate} a ${endDate}):`, error);
    throw error;
  }
};

// Endpoint: POST /estadisticas/turnos_por_especialidad
// Nota: El backend usa POST para recibir las fechas en el body
export const getShiftsBySpecialty = async (startDate, endDate) => {
  try {
    const body = {
      fecha_desde: startDate,
      fecha_hasta: endDate,
    };
    const response = await axiosClient.post("/estadisticas/turnos_por_especialidad", body);
    return response.data.map(mapChartDataFromBackend);
  } catch (error) {
    console.error("Error al obtener turnos por especialidad:", error);
    throw error;
  }
};

// Endpoint: POST /estadisticas/rendimiento-medico
// Nota: El backend usa POST para recibir filtros complejos
export const getMedicalPerformance = async (startDate, endDate, doctorId = null) => {
  try {
    const body = {
      fecha_desde: startDate,
      fecha_hasta: endDate,
      id_medico: doctorId, // Puede ser null si se quieren todos
    };
    
    const response = await axiosClient.post("/estadisticas/rendimiento-medico", body);
    return response.data.map(mapMedicalPerformanceFromBackend);
  } catch (error) {
    console.error("Error al obtener rendimiento médico:", error);
    throw error;
  }
};

// Endpoint: GET /estadisticas/rendimiento-medico/pdf
export const downloadMedicalPerformancePDF = async (startDate, endDate, doctorId = null) => {
  try {
    const response = await axiosClient.get("/estadisticas/rendimiento-medico/pdf", {
      params: {
        fecha_desde: startDate,
        fecha_hasta: endDate,
        id_medico: doctorId,
      },
      responseType: 'blob', // CRUCIAL: Para manejar archivos binarios (PDF)
    });
    
    // Retornamos el blob directamente para que el componente cree la URL
    return response.data; 
  } catch (error) {
    console.error("Error al descargar PDF de rendimiento:", error);
    throw error;
  }
};