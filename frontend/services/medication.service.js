import axiosClient from "./axiosClient";
import { mapRecetaFromBackend } from "../src/utils/mappers"; 


// Endpoint: GET /recetas/
export const getAllRecetas = async () => {
    try {
        const response = await axiosClient.get("/recetas/");
        const data = response.data.map(mapRecetaFromBackend);
        return data;
    } catch (error) {
        console.error("Error al obtener todas las recetas:", error);
        throw error;
    }
};

// Endpoint: GET /recetas/{receta_id}
export const getRecetaById = async (recetaId) => {
    try {
        const response = await axiosClient.get(`/recetas/${recetaId}`);
        const data = mapRecetaFromBackend(response.data);
        return data;
    } catch (error) {
        console.error(`Error al obtener receta ${recetaId}:`, error);
        throw error;
    }
};

// Endpoint: GET /recetas/consulta/{consulta_id}
export const getRecetasByConsultaId = async (consultaId) => {
    try {
        const response = await axiosClient.get(`/recetas/consulta/${consultaId}`);
        const data = response.data.map(mapRecetaFromBackend);
        return data;
    } catch (error) {
        console.error(`Error al obtener recetas para la consulta ${consultaId}:`, error);
        throw error;
    }
};


// Endpoint: POST /recetas/
export const createReceta = async (body) => {
    const { consultationId, medication, dosage, instructions } = body;

    // Mapeamos a snake_case/español para el backend
    const recetaBody = {
        id_consulta: consultationId,
        medicamento: medication,
        dosis: dosage || null,
        instrucciones: instructions || null,
    };

    try {
        const response = await axiosClient.post("/recetas/", recetaBody);
        const data = mapRecetaFromBackend(response.data);
        return data;
    } catch (error) {
        console.error("Error al crear receta:", error);
        throw error;
    }
};


// Endpoint: PUT /recetas/{receta_id}
export const updateReceta = async (recetaId, body) => {
    const { medication, dosage, instructions } = body;

    // Mapeamos a snake_case/español para el backend
    const recetaBody = {
        medicamento: medication,
        dosis: dosage || null,
        instrucciones: instructions || null,
    };

    try {
        const response = await axiosClient.put(
            `/recetas/${recetaId}`,
            recetaBody
        );
        const data = mapRecetaFromBackend(response.data);
        return data;
    } catch (error) {
        console.error(`Error al editar receta ${recetaId}:`, error);
        throw error;
    }
};


// Endpoint: DELETE /recetas/{receta_id}
export const deleteReceta = async (recetaId) => {
    try {
        await axiosClient.delete(`/recetas/${recetaId}`);
        return true;
    } catch (error) {
        console.error(`Error al eliminar receta ${recetaId}:`, error);
        throw error;
    }
};

