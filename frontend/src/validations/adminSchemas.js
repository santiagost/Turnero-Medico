import { commonRules } from "./commonRules";
import { registerValidationSchema } from "./authSchemas";

// --- Esquema de Medicamentos (Uso Médico/Admin) ---
export const medicationValidationSchema = {
  name: commonRules.simpleRequired("nombre"),
  dosage: commonRules.simpleRequired("dosis"),
  instructions: (value) => null, // Opcional
};

// --- Esquema para crear un nuevo paciente por el Admin ---
export const adminCreatePatientSchema = {
  // Reutilizamos reglas comunes para mantener consistencia
  firstName: commonRules.name,
  lastName: (value) => registerValidationSchema.lastname(value), // Reusamos la lógica específica de apellido
  dni: commonRules.dni,
  telephone: commonRules.telephone,
  birthDate: commonRules.birthDate,
  email: commonRules.email,
  
  // Reglas específicas de Perfil (Obra Social)
  membershipNumber: (value, formData) => {
     // Si tienes la lógica de editValidationRules disponible, úsala, 
     // si no, la replicamos aquí o importamos getEditValidationSchema
     if (formData.socialWorkId && !value) { 
         return "El N° de afiliado es requerido si tiene obra social.";
     }
     return null;
  },
  socialWorkId: (value, formData) => {
     if (!value && formData.membershipNumber) {
         return "Seleccione una obra social.";
     }
     return null;
  },
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