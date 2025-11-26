import { REGEX } from "../utils/constants";
import { calculateAge } from "../utils/dateUtils";

/**
 * Reglas de validación atómicas reutilizables para toda la aplicación.
 */
export const commonRules = {
  name: (value) => {
    if (!value) return "Este campo es requerido.";
    if (value.length < 2) return "Debe tener al menos 2 caracteres.";
    if (!REGEX.name.test(value)) return "Inválido (solo letras).";
    return null;
  },
  lastname: (value) => {
    if (!value) return "Este campo es requerido.";
    if (value.length < 2) return "Debe tener al menos 2 caracteres.";
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
    if (!REGEX.phone.test(value)) return "Teléfono inválido (10-15 números).";
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
    const MIN_AGE = 15;
    const [year, month, day] = value.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - MIN_AGE);
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 120);
    if (selectedDate > today) {
      return "La fecha no puede ser futura.";
    }
    if (selectedDate < minDate) {
      return "Fecha inválida (demasiado antigua).";
    }
    if (selectedDate > minAgeDate) {
      return `Debes ser mayor de ${MIN_AGE} años para registrarte.`;
    }
    return null;
  },

  dateRange: (fromDateValue) => (toDateValue) => {
    if (!fromDateValue || !toDateValue) return "La fecha es requerida.";

    // Convertimos a objetos Date para comparar correctamente
    // Asumimos formato YYYY-MM-DD (input type="date" estándar)
    const from = new Date(fromDateValue);
    const to = new Date(toDateValue);

    // Aseguramos que estamos comparando tiempos limpios (00:00:00) para evitar errores de zona horaria
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);

    if (to < from) {
      return "La fecha final no puede ser anterior a la inicial.";
    }
    return null;
  },
};
