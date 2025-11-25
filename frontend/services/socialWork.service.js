import axiosClient from "./axiosClient";
import { mapSocialWorkFromBackend, mapSocialWorkOptionFromBackend } from "../src/utils/mappers";

// Endpoint: GET /obras-sociales/ligero/
export const getSocialWorkOptions = async () => {
  try {
    const response = await axiosClient.get("/obras-sociales/ligero/");
    const data = response.data.map(mapSocialWorkOptionFromBackend);
    return data;
  } catch (error) {
    console.error("Error al obtener opciones de obras sociales:", error);
    throw error;
  }
};

// Endpoint: GET /obras-sociales/{id}
export const getSocialWorkById = async (socialWorkId) => {
  try {
    const response = await axiosClient.get(`/obras-sociales/${socialWorkId}`);      
    const data = mapSocialWorkFromBackend(response.data);
    return data;
  } catch (error) {
    console.error(`Error al obtener la obra social ${socialWorkId}:`, error);
    throw error;
  }
};

// Endpoint: GET /obras-sociales/?id_obra_social=...&nombre=...
export const getAllSocialWorksWithFilters = async ({
  socialWorkId,
  name,
  cuit,
  telephone,
  email
} = {}) => {
  try {
    // Mapeamos los filtros del frontend (inglés) a los query params del backend (español)
    const response = await axiosClient.get("/obras-sociales/", {
      params: {
        id_obra_social: socialWorkId || null,
        nombre: name || null,
        cuit: cuit || null,
        telefono: telephone || null,
        mail: email || null
      },
    });

    const data = response.data.map(mapSocialWorkFromBackend);
    return data;
  } catch (error) {
    console.error("Error al filtrar obras sociales:", error);
    throw error;
  }
};

// Endpoint: POST /obras-sociales/
export const createSocialWork = async (body) => {  
  const { name, cuit, address, telephone, email } = body;
  
  const socialWorkBody = {
    nombre: name,
    cuit: cuit,
    direccion: address,
    telefono: telephone,
    mail: email
  };

  try {
    const response = await axiosClient.post("/obras-sociales/", socialWorkBody);
    const data = mapSocialWorkFromBackend(response.data);
    return data;
  } catch (error) {
    console.error("Error al crear obra social:", error);
    throw error;
  }
};

// Endpoint: PUT /obras-sociales/{id}
export const editSocialWork = async (socialWorkId, body) => {
  const { name, cuit, address, telephone, email } = body;
  
  const socialWorkBody = {
    nombre: name,
    cuit: cuit,
    direccion: address,
    telefono: telephone,
    mail: email
  };

  try {
    const response = await axiosClient.put(
      `/obras-sociales/${socialWorkId}`,
      socialWorkBody
    );
    const data = mapSocialWorkFromBackend(response.data);
    return data;
  } catch (error) {
    console.error(`Error al editar obra social ${socialWorkId}:`, error);
    throw error;
  }
};

// Endpoint: DELETE /obras-sociales/{id}
export const deleteSocialWork = async (socialWorkId) => {
  try {
    const response = await axiosClient.delete(`/obras-sociales/${socialWorkId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar obra social ${socialWorkId}:`, error);
    throw error;
  }
};