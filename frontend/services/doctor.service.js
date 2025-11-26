import axiosClient from "./axiosClient";
import {
  mapDoctorFromBackend,
  mapDoctorOptionFromBackend,
  mapMyPatients,
} from "../src/utils/mappers";

// Endpoint: GET /medicos/ligero/
export const getDoctorOptions = async () => {
  try {
    const response = await axiosClient.get("/medicos/ligero/");
    const data = response.data.map(mapDoctorOptionFromBackend);
    return data;
  } catch (error) {
    console.error("Error al obtener opciones de médicos:", error);
    throw error;
  }
};

// Endpoint: GET /medicos/{id}
export const getDoctorById = async (doctorId) => {
  try {
    const response = await axiosClient.get(`/medicos/${doctorId}`);
    const data = mapDoctorFromBackend(response.data);
    return data;
  } catch (error) {
    console.error(`Error al obtener el médico ${doctorId}:`, error);
    throw error;
  }
};

// Endpoint: GET /medicos/?dni=...&matricula=...
export const getAllDoctorsWithFilters = async ({
  doctorId,
  dni,
  firstName,
  lastName,
  licenseNumber,
  userId,
  specialtyId,
  telephone,
} = {}) => {
  try {
    const response = await axiosClient.get("/medicos/", {
      params: {
        id_medico: doctorId || null,
        dni: dni || null,
        nombre: firstName || null,
        apellido: lastName || null,
        matricula: licenseNumber || null,
        id_usuario: userId || null,
        id_especialidad: specialtyId || null,
        telefono: telephone || null,
      },
    });

    const data = response.data.map(mapDoctorFromBackend);
    return data;
  } catch (error) {
    console.error("Error al filtrar médicos:", error);
    throw error;
  }
};

// Endpoint: GET /medicos/mis_pacientes/{medico_id}
export const getMyPatients = async (doctorId) => {
  try {
    const response = await axiosClient.get(
      `/medicos/mis_pacientes/${doctorId}`
    );
    const data = response.data.map(mapMyPatients);
    return data;
  } catch (error) {
    console.error(`Error al obtener pacientes del médico ${doctorId}:`, error);
    throw error;
  }
};

// Endpoint: POST /medicos/
export const createDoctor = async (body) => {
  const {
    dni,
    firstName,
    lastName,
    licenseNumber,
    telephone,
    specialtyId,
    email,
    emailNotificationActive,
  } = body;

  const doctorBody = {
    dni: dni,
    nombre: firstName,
    apellido: lastName,
    matricula: licenseNumber,
    telefono: telephone,
    email: email,
    id_especialidad: specialtyId,
    noti_cancel_email_act:
      emailNotificationActive !== undefined ? emailNotificationActive : 1,
  };

  try {
    const response = await axiosClient.post("/medicos/", doctorBody);
    const data = mapDoctorFromBackend(response.data);
    return data;
  } catch (error) {
    console.error("Error al crear médico:", error);
    throw error;
  }
};

// Endpoint: PUT /medicos/{id}
export const editDoctor = async (doctorId, body) => {
  const { firstName, lastName, telephone, specialtyId } = body;

  const doctorBody = {
    nombre: firstName,
    apellido: lastName,
    telefono: telephone,
    id_especialidad: specialtyId,
  };

  try {
    const response = await axiosClient.put(`/medicos/${doctorId}`, doctorBody);
    const data = mapDoctorFromBackend(response.data);
    return data;
  } catch (error) {
    console.error(`Error al editar médico ${doctorId}:`, error);
    throw error;
  }
};

// Endpoint: DELETE /medicos/{id}
export const deleteDoctor = async (doctorId) => {
  try {
    const response = await axiosClient.delete(`/medicos/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar médico ${doctorId}:`, error);
    throw error;
  }
};
