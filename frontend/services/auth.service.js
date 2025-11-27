import axiosClient from "./axiosClient";
import { getAllPatientsWithFilters } from "./patient.service";
import { getAllDoctorsWithFilters } from "./doctor.service";
import { mapFrontendRoleToBackend } from "../src/utils/mappers";

export const userLogin = async ({ email, password, role }) => {
  const backendRolName = mapFrontendRoleToBackend(role);

  const loginBody = {
    email: email,
    password: password,
    rol: backendRolName,
  };

  try {
    const response = await axiosClient.post("/auth/login", loginBody);
    return response.data;
  } catch (error) {
    console.error("Error al iniciar sesión:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const changePassword = async ({
  id_usuario,
  current_password,
  new_password,
}) => {
  const changePasswordBody = {
    id_usuario: id_usuario,
    current_password: current_password,
    new_password: new_password,
  };

  try {
    const response = await axiosClient.put(
      "/auth/change-password",
      changePasswordBody
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error al cambiar la contraseña:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};


export const recoverPassword = async (email) => {
  const recoverPasswordBody = {
    email: email,
  };

  try {
    const response = await axiosClient.post(
      "/auth/recover-password",
      recoverPasswordBody
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error al recuperar la contraseña:",
      error.response?.data || error.message
    );
    throw error.response?.data || error;
  }
};

export const getPatientByUserId = async (userId) => {
    const patients = await getAllPatientsWithFilters({ userId });
    if (patients.length === 0) {
        throw new Error("No se encontró paciente asociado a este ID de usuario.");
    }
    return patients[0];
};


export const getDoctorByUserId = async (userId) => {    
    const doctors = await getAllDoctorsWithFilters({ userId }); 
    if (doctors.length === 0) {
        throw new Error("No se encontró médico asociado a este ID de usuario.");
    }
    return doctors[0];
};