import axiosClient from "./axiosClient";
import { mapConsultationFromBackend } from "../src/utils/mappers";

// Endpoint: GET /consultas/
export const getAllConsultations = async () => {
  try {
    const response = await axiosClient.get("/consultas/");
    const data = response.data.map(mapConsultationFromBackend);
    return data;
  } catch (error) {
    console.error("Error al obtener consultas:", error);
    throw error;
  }
};

// Endpoint: GET /consultas/{id}
export const getConsultationById = async (consultationId) => {
  try {
    const response = await axiosClient.get(`/consultas/${consultationId}`);
    const data = mapConsultationFromBackend(response.data);
    return data;
  } catch (error) {
    console.error(`Error al obtener la consulta ${consultationId}:`, error);
    throw error;
  }
};

// Endpoint: GET /consultas/paciente/{id_paciente}
export const getConsultationsByPatient = async (patientId) => {
  try {
    const response = await axiosClient.get(`/consultas/paciente/${patientId}`);
    console.log(response.data)
    const data = response.data.map(mapConsultationFromBackend);
    
    return data;
  } catch (error) {
    console.error(`Error al obtener las consultas del paciente ${patientId}:`, error);
    throw error;
  }
};

// Endpoint: POST /consultas/
export const createConsultation = async (body) => {
  const { shiftId, diagnosis, medicalNotes, treatment } = body;

  const consultationBody = {
    id_turno: shiftId,
    diagnostico: diagnosis,
    notas_privadas_medico: medicalNotes,
    tratamiento: treatment,
  };

  try {
    const response = await axiosClient.post("/consultas/", consultationBody);
    const data = mapConsultationFromBackend(response.data);
    return data;
  } catch (error) {
    console.error("Error al crear consulta:", error);
    throw error;
  }
};

// Endpoint: PUT /consultas/{id}
export const updateConsultation = async (consultationId, body) => {
  const { diagnosis, medicalNotes, treatment } = body;

  const consultationBody = {
    diagnostico: diagnosis,
    notas_privadas_medico: medicalNotes,
    tratamiento: treatment,
  };

  try {
    const response = await axiosClient.put(
      `/consultas/${consultationId}`,
      consultationBody
    );
    const data = mapConsultationFromBackend(response.data);
    return data;
  } catch (error) {
    console.error(`Error al editar consulta ${consultationId}:`, error);
    throw error;
  }
};

// Endpoint: DELETE /consultas/{id}
export const deleteConsultation = async (consultationId) => {
  try {
    await axiosClient.delete(`/consultas/${consultationId}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar consulta ${consultationId}:`, error);
    throw error;
  }
};

// GET /consultas/pacientes_por_fecha?fecha_consulta=YYYY-MM-DD
export const getPatientIdsByDate = async (dateString) => {
  try {
    console.log(dateString)
    const response = await axiosClient.get("/consultas/pacientes_por_fecha", {
      params: {
        fecha_consulta: dateString, // Asegúrate que el formato coincida con el backend (ej: "2023-10-25")
      },
    });
    return response.data; 
  } catch (error) {    
    if (error.response && error.response.status === 404) {
        return []; 
    }
    console.error(`Error al obtener pacientes por fecha ${dateString}:`, error);
    throw error;
  }
};

// GET /consultas/pacientes_por_fecha?fecha_consulta=YYYY-MM-DD
export const getConsultationsIdsByDate = async (dateString) => {
  try {
    const response = await axiosClient.get("/consultas/consultas_por_fecha", {
      params: {
        fecha_consulta: dateString, // Asegúrate que el formato coincida con el backend (ej: "2023-10-25")
      },
    });
    return response.data; 
  } catch (error) {    
    if (error.response && error.response.status === 404) {
        return []; 
    }
    console.error(`Error al obtener consulta por fecha ${dateString}:`, error);
    throw error;
  }
};