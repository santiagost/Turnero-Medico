import { commonRules } from "./commonRules";
import { registerValidationSchema } from "./authSchemas";

// --- Esquema de Medicamentos (Uso Médico/Admin) ---
export const medicationValidationSchema = {
  name: commonRules.simpleRequired("nombre"),
  dosage: commonRules.simpleRequired("dosis"),
  instructions: (value) => null, // Opcional
};

// --- Esquema para crear un nuevo paciente por el Admin ---
export const adminCreatePatientSchema = (particularId = null) => {
    return {
        firstName: commonRules.name,
        lastName: (value) => registerValidationSchema.lastname(value),
        dni: commonRules.dni,
        telephone: commonRules.telephone,
        birthDate: commonRules.birthDate,
        email: commonRules.email,

        // 🌟 REGLA DE VALIDACIÓN ADAPTADA PARA membershipNumber 🌟
        membershipNumber: (value, formData) => {
            const isParticular = formData.socialWorkId == particularId;

            // 1. Caso: Obra Social NO Particular (Requiere N° de Afiliado)
            if (formData.socialWorkId && !isParticular && !value) {
                return "El N° de afiliado es requerido para esta obra social.";
            }

            // 2. Caso: Obra Social SÍ Particular (NO Debe tener N° de Afiliado)
            if (isParticular && value) {
                return "No se requiere N° de afiliado para la Obra Social 'Particular'. Por favor, déjelo vacío.";
            }

            return null;
        },
        // -----------------------------------------------------------------

        socialWorkId: (value, formData) => {
            if (!value && formData.membershipNumber) {
                return "Seleccione una obra social.";
            }
            return null;
        },
    };
};

// --- Esquema de Creación de Médico por Admin ---
export const adminCreateDoctorSchema = {
  firstName: commonRules.name,
  lastName: (value) => registerValidationSchema.lastname(value),
  dni: commonRules.dni,
  telephone: commonRules.telephone,
  email: commonRules.email,
  
  licenseNumber: commonRules.simpleRequired("número de matrícula"),
  specialtyId: commonRules.simpleRequired("especialidad"),
};


// --- Esquema de Obra Social ---
export const adminCreateSocialWorkSchema = {
  name: (value) => {
    if (!value) return "El nombre es requerido.";
    if (value.length < 3) return "El nombre debe tener al menos 3 caracteres.";
    return null;
  },
  cuit: (value) => {
    if (!value) return "El CUIT es requerido.";
    if (!/^\d{2}-\d{8}-\d{1}$/.test(value)) return "Formato inválido (XX-XXXXXXXX-X).";
    return null;
  },
  telephone: (value) => {
    if (!value) return "El teléfono es requerido.";
    // Validación simple de solo números para teléfono de contacto
    if (!/^\d{10,}$/.test(value.replace(/\D/g, ''))) return "Mínimo 10 dígitos numéricos.";
    return null;
  },
  address: (value) => {
    if (!value) return "La dirección es requerida.";
    if (value.length < 5) return "Mínimo 5 caracteres.";
    return null;
  },
  email: commonRules.email,
};

// --- Esquema de Especialidad ---
export const adminCreateSpecialtySchema = {
  name: (value) => {
    if (!value) return "El nombre es requerido.";
    if (value.length < 3) return "Mínimo 3 caracteres.";
    return null;
  },
  description: (value) => {
    if (!value) return "La descripción es requerida.";
    if (value.length < 10) return "Mínimo 10 caracteres.";
    return null;
  }
};

// Constantes para usar en la validación
const START_HOUR_CANVAS = 7;
const END_HOUR_CANVAS = 21;

export const adminDoctorScheduleSchema = {
  dayOfWeek: (value) => {
    if (value === "" || value === undefined || value === null) return "Seleccione un día.";
    return null;
  },
  
  startTime: (value) => {
    if (!value) return "Requerido.";
    
    const [hours] = value.split(':').map(Number);
    if (hours < START_HOUR_CANVAS || hours >= END_HOUR_CANVAS) {
      return `El horario debe ser entre ${START_HOUR_CANVAS}:00 y ${END_HOUR_CANVAS}:00.`;
    }
    return null;
  },

  endTime: (value, formData) => {
    if (!value) return "Requerido.";
    
    // 1. Validar que sea mayor al inicio
    if (formData.startTime && value <= formData.startTime) {
      return "El fin debe ser mayor al inicio.";
    }

    // 2. Validar limites del canvas
    const [hours] = value.split(':').map(Number);
    if (hours > END_HOUR_CANVAS || (hours === END_HOUR_CANVAS && value.split(':')[1] !== "00")) {
        return `No puede exceder las ${END_HOUR_CANVAS}:00.`;
    }

    return null;
  },

  durationMinutes: (value, formData) => {
    if (!value) return "Requerido.";
    if (Number(value) < 5) return "Mínimo 5 min.";

    // 3. Validar coherencia matemática: ¿Entra un turno en ese rango?
    if (formData.startTime && formData.endTime) {
        const start = new Date(`1970-01-01T${formData.startTime}:00`);
        const end = new Date(`1970-01-01T${formData.endTime}:00`);
        const diffMinutes = (end - start) / 60000; // Diferencia en minutos

        if (Number(value) > diffMinutes) {
            return `La duración excede el rango horario (${diffMinutes} min).`;
        }
    }

    return null;
  }
};