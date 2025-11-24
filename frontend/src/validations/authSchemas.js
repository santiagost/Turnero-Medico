import { REGEX } from "../utils/constants";
import { commonRules } from "./commonRules";

// --- Esquema de Registro ---
export const registerValidationSchema = {
  name: commonRules.name,
  lastname: commonRules.lastname,
  dni: commonRules.dni,
  telephone: commonRules.telephone,
  birthDate: commonRules.birthDate,
  email: commonRules.email,
  confirmEmail: (value, formData) => {
    if (value !== formData.email) return "Los correos no coinciden.";
    return null;
  },
  password: commonRules.password,
  confirmPassword: (value, formData) => {
    if (value !== formData.password) return "Las contraseñas no coinciden.";
    return null;
  },
};

// --- Esquema de Login ---
export const loginValidationSchema = {
  email: commonRules.email,
  password: (value) => {
    if (!value) return "La contraseña es requerida.";
    return null;
  },
  role: (value) => {
    if (!value) return "Debes seleccionar un rol.";
    return null;
  },
};

// --- Esquema de Olvidar Contraseña ---
export const forgotPasswordValidationSchema = {
  email: commonRules.email,
};

// --- Esquema de Seguridad (Cambiar Contraseña) ---
export const securityValidationSchema = {
  currentPassword: (value) => {
    if (!value) return "La contraseña actual es requerida.";
    return null;
  },
  newPassword: commonRules.password,
  confirmPassword: (value, formData) => {
    if (value !== formData.newPassword) return "Las contraseñas no coinciden.";
    return null;
  },
};

// --- Lógica de Edición de Perfil ---
const editValidationRules = {
  telephone: commonRules.telephone,
  membershipNumber: (value, formData) => {
    if (formData.socialWork && !value) {
      return "El N° de afiliado es requerido si tienes obra social.";
    }
    return null;
  },
  socialWork: (value, formData) => {
    if (!value && formData.membershipNumber) {
      return "Debes seleccionar una obra social si tienes un N° de afiliado.";
    }
    return null;
  },
};

export const getEditValidationSchema = (role) => {
  const schema = {};
  schema.telephone = editValidationRules.telephone;

  if (role === "Patient") {
    schema.membershipNumber = editValidationRules.membershipNumber;
    schema.socialWork = editValidationRules.socialWork;
  }
  return schema;
};