import axiosClient from "./axiosClient";
import { mapPatientFromBackend } from "../src/utils/mappers";

// Endpoint: GET /pacientes/{id}
export const getPatientById = async (patientId) => {
  try {
    const response = await axiosClient.get(`/pacientes/${patientId}`);
    const data = mapPatientFromBackend(response.data);
    return data;
  } catch (error) {
    console.error(`Error al obtener el paciente ${patientId}:`, error);
    throw error;
  }
};

// Endpoint: GET /pacientes/?id_paciente=...&dni=...&nombre=...
export const getAllPatientsWithFilters = async ({
  patientId,
  dni,
  firstName,
  lastName,
  socialWorkId,
} = {}) => {
  try {
    const response = await axiosClient.get("/pacientes/", {
      params: {
        id_paciente: patientId || null,
        dni: dni || null,
        nombre: firstName || null,
        apellido: lastName || null,
        id_obra_social: socialWorkId || null,
      },
    });

    const data = response.data.map(mapPatientFromBackend);
    return data;
  } catch (error) {
    console.error("Error al filtrar pacientes:", error);
    throw error;
  }
};

// Endpoint: POST /pacientes/
export const createPatient = async (body) => {
  // Desestructuramos datos en inglés (Frontend)
  const {
    dni,
    firstName,
    lastName,
    telephone,
    userId,
    birthDate,
    socialWorkId,
    membershipNumber,
  } = body;

  // Mapeamos a español (Backend)
  const patientBody = {
    dni: dni,
    nombre: firstName,
    apellido: lastName,
    telefono: telephone,
    id_usuario: userId || null,
    fecha_nacimiento: birthDate,
    id_obra_social: socialWorkId || null,
    nro_afiliado: membershipNumber || null,
  };

  try {
    const response = await axiosClient.post("/pacientes/", patientBody);
    const data = mapPatientFromBackend(response.data);
    return data;
  } catch (error) {
    console.error("Error al crear paciente:", error);
    throw error;
  }
};

// Endpoint: PUT /pacientes/{id}
export const updatePatient = async (patientId, body) => {
  // Desestructuramos datos en inglés (Frontend)
  const {
    firstName,
    lastName,
    birthDate,
    telephone,
    socialWorkId,
    membershipNumber,
    emailNotificationActive
  } = body;

  // Mapeamos a español (Backend)
  const patientBody = {
    nombre: firstName,
    apellido: lastName,
    fecha_nacimiento: birthDate,
    telefono: telephone,
    id_obra_social: socialWorkId || null,
    nro_afiliado: membershipNumber || null,
  };

  try {
    const response = await axiosClient.put(
      `/pacientes/${patientId}`,
      patientBody
    );
    const data = mapPatientFromBackend(response.data);
    return data;
  } catch (error) {
    console.error(`Error al editar paciente ${patientId}:`, error);
    throw error;
  }
};

// Endpoint: DELETE /pacientes/{id}
export const deletePatient = async (patientId) => {
  try {
    const response = await axiosClient.delete(`/pacientes/${patientId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar paciente ${patientId}:`, error);
    throw error;
  }
};