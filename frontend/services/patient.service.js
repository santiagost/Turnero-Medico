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

const DEFAULT_PARTICULAR_ID = 3;
// Endpoint: POST /pacientes/
export const createPatient = async (body, socialWorkOptions) => {
  // Desestructuramos datos del Frontend
  const {
    dni,
    firstName,
    lastName,
    telephone,
    email,
    password,
    birthDate,
    socialWorkId,
    membershipNumber,
  } = body;

  const particularOption = socialWorkOptions.find((opt) =>
    opt.label.toLowerCase().includes("particular")
  );
  const ID_OBRA_SOCIAL_PARTICULAR = particularOption
    ? particularOption.value
    : DEFAULT_PARTICULAR_ID;

  let obraSocialFields = {};

  if (socialWorkId && socialWorkId !== ID_OBRA_SOCIAL_PARTICULAR) {
    if (!membershipNumber) {
      console.warn(
        "ADVERTENCIA: Falta el número de afiliado para la Obra Social. Se enviará null."
      );
    }
    obraSocialFields = {
      id_obra_social: socialWorkId,
      ...(membershipNumber && { nro_afiliado: membershipNumber }),
    };
  } else if (socialWorkId === ID_OBRA_SOCIAL_PARTICULAR) {
    obraSocialFields = {
      id_obra_social: ID_OBRA_SOCIAL_PARTICULAR,
    };
  }

  // 3. Mapeamos a español (Backend)
  const patientBody = {
    dni: dni,
    nombre: firstName,
    apellido: lastName,
    telefono: telephone,
    email: email,
    fecha_nacimiento: birthDate,
    ...(password && { password: password }),
    ...obraSocialFields,
  };

  try {
    const response = await axiosClient.post("/pacientes/", patientBody);
    const data = mapPatientFromBackend(response.data);
    return data;
  } catch (error) {
    console.error(
      "Error al crear paciente:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

// Endpoint: PUT /pacientes/{id}
export const editPatient = async (patientId, body) => {
  // Desestructuramos datos en inglés (Frontend)
  const {
    firstName,
    lastName,
    birthDate,
    telephone,
    socialWorkId,
    membershipNumber,
  } = body;

  // Mapeamos a español (Backend)
  const patientBody = {
    nombre: firstName,
    apellido: lastName,
    fecha_nacimiento: birthDate,
    telefono: telephone,
    id_obra_social: socialWorkId || null,
    nro_afiliado:
      membershipNumber === undefined || membershipNumber === null
        ? null
        : membershipNumber,
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
