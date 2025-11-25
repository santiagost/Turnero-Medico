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
  // Movemos membershipNumber dentro de la función generadora
  socialWork: (value, formData) => {
    if (!value && formData.membershipNumber) {
      return "Debes seleccionar una obra social si tienes un N° de afiliado.";
    }
    return null;
  },
};

// MODIFICACIÓN AQUÍ: Aceptamos particularId como segundo argumento
export const getEditValidationSchema = (role, particularId = null) => {
  const schema = {};
  schema.telephone = editValidationRules.telephone;

  if (role === "Patient") {
    schema.socialWork = editValidationRules.socialWork;

    // Definimos la regla aquí dentro para tener acceso a particularId
    schema.membershipNumber = (value, formData) => {
      // Usamos == para comparar (por si uno es string y el otro number)
      const isParticular = formData.socialWork == particularId;

      // Si hay obra social seleccionada, Y NO es Particular, Y no hay valor... ERROR
      if (formData.socialWork && !isParticular && !value) {
        return "El N° de afiliado es requerido para esta obra social.";
      }
      return null;
    };
  }
  return schema;
};
