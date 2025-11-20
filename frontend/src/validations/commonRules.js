import { REGEX } from "../utils/constants";

/**
 * Reglas de validación atómicas reutilizables para toda la aplicación.
 */
export const commonRules = {
  name: (value) => {
    if (!value) return "Este campo es requerido.";
    if (!REGEX.name.test(value)) return "Inválido (solo letras).";
    return null;
  },
  
  dni: (value) => {
    if (!value) return "El DNI es requerido.";
    if (!REGEX.dni.test(value)) return "DNI inválido (7-8 números).";
    return null;
  },

  telephone: (value) => {
    if (!value) return "El teléfono es requerido.";
    if (!REGEX.phone.test(value)) return "Teléfono inválido (10-13 números).";
    return null;
  },

  email: (value) => {
    if (!value) return "El correo es requerido.";
    if (!REGEX.email.test(value)) return "Formato de correo inválido.";
    return null;
  },

  password: (value) => {
    if (!value) return "La contraseña es requerida.";
    if (!REGEX.password.test(value))
      return "Mín. 8 caracteres, 1 mayús., 1 minús. y 1 núm.";
    return null;
  },

  simpleRequired: (fieldName) => (value) => {
    if (!value) return `El ${fieldName} es requerido.`;
    return null;
  },
  
  birthDate: (value) => {
    if (!value) return "La fecha es requerida.";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = value.split("-").map(Number);
    // Nota: month - 1 porque en JS los meses van de 0 a 11
    const selectedDate = new Date(year, month - 1, day);
    if (selectedDate > today) {
      return "La fecha no puede ser futura.";
    }
    return null;
  }
};