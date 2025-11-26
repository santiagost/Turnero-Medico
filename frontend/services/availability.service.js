import axiosClient from "./axiosClient";
import { 
  mapAvailabilityFromBackend,
  mapFrontendDayToBackend
} from "../src/utils/mappers";

// Endpoint: GET /horarios-atencion/
export const getAllAvailabilities = async () => {
  try {
    const response = await axiosClient.get("/horarios-atencion/");
    const data = response.data.map(mapAvailabilityFromBackend);
    return data;
  } catch (error) {
    console.error("Error al obtener todos los horarios de atención:", error);
    throw error;
  }
};

// Endpoint: GET /horarios-atencion/{id}
export const getAvailabilityById = async (availabilityId) => {
  try {
    const response = await axiosClient.get(`/horarios-atencion/${availabilityId}`);
    const data = mapAvailabilityFromBackend(response.data);
    return data;
  } catch (error) {
    console.error(`Error al obtener el horario ${availabilityId}:`, error);
    throw error;
  }
};

// Endpoint: GET /horarios-atencion/medico/{medico_id}
export const getAvailabilitiesByDoctor = async (doctorId) => {
  try {
    const response = await axiosClient.get(`/horarios-atencion/medico/${doctorId}`);
    const data = response.data.map(mapAvailabilityFromBackend);
    return data;
  } catch (error) {
    console.error(`Error al obtener horarios del médico ${doctorId}:`, error);
    throw error;
  }
};

// Endpoint: PUT /horarios-atencion/medico/{medico_id}
// Este endpoint actualiza la lista completa de horarios de un médico
export const updateAvailabilitiesForDoctor = async (doctorId, availabilitiesData) => {
  // Mapeamos el array de entrada al formato snake_case que espera el backend
  const availabilitiesBody = availabilitiesData.map(item => ({
    dia_semana: mapFrontendDayToBackend(item.dayOfWeek),
    hora_inicio: item.startTime,
    hora_fin: item.endTime,
    duracion_turno_min: item.durationMinutes || 30
  }));

  try {
    const response = await axiosClient.put(
      `/horarios-atencion/medico/${doctorId}`,
      availabilitiesBody
    );
    // El backend devuelve la lista de nuevos horarios creados
    const data = response.data.map(mapAvailabilityFromBackend);
    return data;
  } catch (error) {
    console.error(`Error al actualizar horarios masivos para el médico ${doctorId}:`, error);
    throw error;
  }
};

// Endpoint: POST /horarios-atencion/
export const createAvailability = async (body) => {
  const {
    doctorId,
    dayOfWeek,
    startTime,
    endTime,
    durationMinutes
  } = body;

  const availabilityBody = {
    id_medico: doctorId,
    dia_semana: dayOfWeek,
    hora_inicio: startTime,
    hora_fin: endTime,
    duracion_turno_min: durationMinutes || 30
  };

  try {
    const response = await axiosClient.post("/horarios-atencion/", availabilityBody);
    const data = mapAvailabilityFromBackend(response.data);
    return data;
  } catch (error) {
    console.error("Error al crear horario de atención:", error);
    throw error;
  }
};

// Endpoint: PUT /horarios-atencion/{id}
export const updateAvailability = async (availabilityId, body) => {
  const {
    dayOfWeek,
    startTime,
    endTime,
    durationMinutes
  } = body;

  const availabilityBody = {
    dia_semana: dayOfWeek,
    hora_inicio: startTime,
    hora_fin: endTime,
    duracion_turno_min: durationMinutes
  };

  try {
    const response = await axiosClient.put(
      `/horarios-atencion/${availabilityId}`, 
      availabilityBody
    );
    const data = mapAvailabilityFromBackend(response.data);
    return data;
  } catch (error) {
    console.error(`Error al editar horario ${availabilityId}:`, error);
    throw error;
  }
};

// Endpoint: DELETE /horarios-atencion/{id}
export const deleteAvailability = async (availabilityId) => {
  try {
    const response = await axiosClient.delete(`/horarios-atencion/${availabilityId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar horario ${availabilityId}:`, error);
    throw error;
  }
};