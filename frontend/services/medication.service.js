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


// Endpoint: GET /recetas/pdf/{consulta_id}
export const getRecetasPdfByConsultaId = async (consultaId) => {
    try {
        const response = await axiosClient.get(
            `/recetas/pdf/${consultaId}`, 
            {
                responseType: 'blob' // Especifica que la respuesta es un blob binario
            }
        );

        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = window.URL.createObjectURL(pdfBlob);
        const contentDisposition = response.headers['content-disposition'];
        let fileName = `recetas_consulta_${consultaId}.pdf`; // Nombre de archivo por defecto

        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
            if (fileNameMatch && fileNameMatch.length > 1) {
                fileName = fileNameMatch[1];
            }
        }
        
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.setAttribute('download', fileName); // Establece el nombre de archivo para la descarga
        
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        window.URL.revokeObjectURL(pdfUrl);

        return true; // Indica que la descarga fue iniciada
    } catch (error) {
        console.error(`Error al descargar el PDF de recetas para la consulta ${consultaId}:`, error);
        
        if (error.response && error.response.data instanceof Blob) {
            const errorText = await error.response.data.text();
            try {
                const errorJson = JSON.parse(errorText);
                console.error("Mensaje de error del backend:", errorJson.detail);
                throw new Error(errorJson.detail || `Error al descargar PDF para la consulta ${consultaId}`);
            } catch (parseError) {
                throw new Error(`Error al descargar PDF para la consulta ${consultaId}`);
            }
        }

        throw error;
    }
};