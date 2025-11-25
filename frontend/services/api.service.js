import axiosClient from './axiosClient';

export const getSystemStatus = async () => {
  try {
    const response = await axiosClient.get('/'); 
    
    return response.data;
  } catch (error) {
    console.error("Error al conectar con la API:", error);
    throw error;
  }
};