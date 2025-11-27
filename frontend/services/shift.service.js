import axiosClient from "./axiosClient";
import { mapShiftFromBackend } from "../src/utils/mappers";

// Endpoint: GET /turnos/
export const getAllShifts = async () => {
  try {
    const response = await axiosClient.get("/turnos/");
    return response.data.map(mapShiftFromBackend);
  } catch (error) {
    console.error("Error al obtener todos los turnos:", error);
    throw error;
  }
};

// Endpoint: GET /turnos/{id}
export const getShiftById = async (shiftId) => {
  try {
    const response = await axiosClient.get(`/turnos/${shiftId}`);
    return mapShiftFromBackend(response.data);
  } catch (error) {
    console.error(`Error al obtener el turno ${shiftId}:`, error);
    throw error;
  }
};

// Endpoint: GET /turnos/paciente/proximos/{id}
export const getNextShiftsForPatient = async (patientId) => {
  try {
    const response = await axiosClient.get(
      `/turnos/paciente/proximos/${patientId}`
    );
    return response.data.map(mapShiftFromBackend);
  } catch (error) {
    console.error(
      `Error al obtener próximos turnos del paciente ${patientId}:`,
      error
    );
    throw error;
  }
};

// Endpoint: GET /turnos/medico/proximos/{id}
export const getNextShiftsForDoctor = async (doctorId) => {
  try {
    const response = await axiosClient.get(
      `/turnos/medico/proximos/${doctorId}`
    );
    return response.data.map(mapShiftFromBackend);
  } catch (error) {
    console.error(
      `Error al obtener próximos turnos del médico ${doctorId}:`,
      error
    );
    throw error;
  }
};

// Endpoint: GET /turnos/paciente/historial
export const getPatientHistory = async (patientId, startDate, endDate) => {
  try {
    const response = await axiosClient.get("/turnos/paciente/historial", {
      params: {
        paciente_id: patientId,
        fecha_desde: startDate,
        fecha_hasta: endDate,
      },
    });
    return response.data.map(mapShiftFromBackend);
  } catch (error) {
    console.error(
      `Error al obtener historial del paciente ${patientId}:`,
      error
    );
    throw error;
  }
};

// Endpoint: GET /turnos/medico/agenda
export const getDoctorAgenda = async (doctorId, startDate, endDate) => {
  try {
    const response = await axiosClient.get("/turnos/medico/agenda", {
      params: {
        id_medico: doctorId,
        fecha_desde: startDate,
        fecha_hasta: endDate,
      },
    });
    const data = response.data.map(mapShiftFromBackend);
    return data;
  } catch (error) {
    console.error(`Error al obtener agenda del médico ${doctorId}:`, error);
    throw error;
  }
};

// Endpoint: POST /turnos/
export const createShift = async (shiftData) => {
  // Mapeamos de camelCase (Frontend) a snake_case (Backend)
  const payload = {
    id_paciente: shiftData.patientId,
    id_medico: shiftData.doctorId,
    fecha_hora_inicio: shiftData.startTime, // "YYYY-MM-DD HH:MM:SS"
    fecha_hora_fin: shiftData.endTime,
    motivo_consulta: shiftData.reason,
    id_estado_turno: shiftData.statusId || 1, // Default a Pendiente/Programado si no viene
  };

  try {
    const response = await axiosClient.post("/turnos/", payload);
    return mapShiftFromBackend(response.data);
  } catch (error) {
    console.error("Error al crear turno:", error);
    throw error;
  }
};

// Endpoint: PUT /turnos/{id}
export const editShift = async (shiftId, shiftData) => {
  // Nota: El backend espera un dict genérico, enviamos solo lo que queremos actualizar
  // o el objeto completo mapeado, dependiendo de cómo manejes el form.
  // Aquí asumo que envías keys en snake_case o las transformas.

  const payload = {};
  if (shiftData.patientId) payload.id_paciente = shiftData.patientId;
  if (shiftData.doctorId) payload.id_medico = shiftData.doctorId;
  if (shiftData.startTime) payload.fecha_hora_inicio = shiftData.startTime;
  if (shiftData.endTime) payload.fecha_hora_fin = shiftData.endTime;
  if (shiftData.reason) payload.motivo_consulta = shiftData.reason;
  if (shiftData.statusId) payload.id_estado_turno = shiftData.statusId;

  try {
    const response = await axiosClient.put(`/turnos/${shiftId}`, payload);
    return mapShiftFromBackend(response.data);
  } catch (error) {
    console.error(`Error al actualizar el turno ${shiftId}:`, error);
    throw error;
  }
};

// Endpoint: POST /turnos/cancelar
export const cancelShiftById = async (shiftId) => {
  try {
    const payload = {
      id_turno: shiftId,
    };
    const response = await axiosClient.post("/turnos/cancelar", payload);
    const data = mapShiftFromBackend(response.data);
    return data;
  } catch (error) {
    console.error(`Error al cancelar turno ${shiftId}:`, error);
    throw error;
  }
};

// Endpoint: DELETE /turnos/{id}
export const deleteShift = async (shiftId) => {
  try {
    await axiosClient.delete(`/turnos/${shiftId}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar turno ${shiftId}:`, error);
    throw error;
  }
};

// Endpoint: GET /turnos/prueba_notificaciones
export const triggerNotificationTest = async () => {
  try {
    const response = await axiosClient.get("/turnos/prueba_notificaciones");
    // La respuesta es { mensaje: "...", turnos: [...] }
    return {
      message: response.data.mensaje,
      notifiedShifts: response.data.turnos.map(mapShiftFromBackend),
    };
  } catch (error) {
    console.error("Error al probar notificaciones:", error);
    throw error;
  }
};
