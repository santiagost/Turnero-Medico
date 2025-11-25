import axiosClient from "./axiosClient";
import {
  mapSpecialtyFromBackend,
  mapSpecialtyOptionFromBackend,
} from "../src/utils/mappers";

// Endpoint GET /especialidades/ligero/
export const getSpecialtyOptions = async () => {
  try {
    const response = await axiosClient.get("/especialidades/ligero/");
    const data = response.data.map(mapSpecialtyOptionFromBackend);
    return data;
  } catch (error) {
    console.error("Error al obtener opciones de especialidades:", error);
    throw error;
  }
};

// Endpoint: GET /especialidades/{id}
export const getSpecialtyById = async (specialtyId) => {
  try {
    const response = await axiosClient.get(`/especialidades/${specialtyId}`);
    const data = mapSpecialtyFromBackend(response.data);
    return data;
  } catch (error) {
    console.error(`Error al obtener la especialidad ${specialtyId}:`, error);
    throw error;
  }
};

// Endpoint: GET /especialidades/?id_especialidad=...&nombre=...
export const getAllSpecialtyWithFilters = async ({
  specialtyId,
  name,
} = {}) => {
  try {
    const response = await axiosClient.get("/especialidades/", {
      params: {
        id_especialidad: specialtyId || null,
        nombre: name || null,
      },
    });

    const data = response.data.map(mapSpecialtyFromBackend);
    return data;
  } catch (error) {
    console.error("Error al filtrar especialidades:", error);
    throw error;
  }
};

// Endpoint: POST /especialidades/
export const createSpecialty = async (body) => {
  const { name, description } = body;
  const specialtyBody = {
    nombre: name,
    descripcion: description,
  };

  try {
    // El 'body' debe ser un objeto: { nombre: "...", descripcion: "..." }
    const response = await axiosClient.post("/especialidades/", specialtyBody);
    const data = mapSpecialtyFromBackend(response.data);
    return data;
  } catch (error) {
    console.error("Error al crear especialidad:", error);
    throw error;
  }
};

// Enpoint: PUT /especialidades/{id}
export const editSpecialty = async (specialtyId, body) => {
  const { name, description } = body;
  const specialtyBody = {
    nombre: name,
    descripcion: description,
  };

  try {
    // El 'body' debe ser un objeto: { nombre: "...", descripcion: "..." }
    const response = await axiosClient.put(
      `/especialidades/${specialtyId}`,
      specialtyBody
    );
    const data = mapSpecialtyFromBackend(response.data);
    return data;
  } catch (error) {
    console.error(`Error al editar especialidad ${specialtyId}:`, error);
    throw error;
  }
};

// Endpoint: DELETE /especialidades/{id}
export const deleteSpecialty = async (specialtyId) => {
  try {
    const response = await axiosClient.delete(`/especialidades/${specialtyId}`);
    // El backend devuelve 204 No Content, por lo que response.data estará vacío o null, lo cual está bien.
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar especialidad ${specialtyId}:`, error);
    throw error;
  }
};
