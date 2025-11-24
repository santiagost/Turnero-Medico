import { commonRules } from "./commonRules";

export const newShiftSchema = {
  // Paso 1: Selección de profesional y horario
  specialty: commonRules.simpleRequired("especialidad"),
  doctor: commonRules.simpleRequired("médico"),
  date: commonRules.simpleRequired("fecha"),
  time: commonRules.simpleRequired("horario"),

  // Paso 2: Motivo (en el modal)
  reason: (value) => {
    if (!value || value.trim() === "")
      return "El motivo de consulta es obligatorio.";
    if (value.length < 5)
      return "El motivo es muy corto (mínimo 5 caracteres).";
    return null;
  },
};

export const newAdminShiftSchema = {
  // --- SECCIÓN 1: DATOS DEL TURNO ---
  specialty: commonRules.simpleRequired("especialidad"),
  doctor: commonRules.simpleRequired("médico"),
  date: commonRules.simpleRequired("fecha"),
  time: commonRules.simpleRequired("horario"),

  // --- SECCIÓN 2: DATOS DEL PACIENTE ---
  // Estos se validan cuando isPatientManual es true o se encontró un paciente

  dni: commonRules.dni,
  firstName: commonRules.name,
  lastName: commonRules.name,
  telephone: commonRules.telephone,
  socialWorkId: commonRules.simpleRequired("obra social"),

  // El número de afiliado suele ser alfanumérico y variar según la obra social.
  // Aquí definimos una regla local específica si no existe en commonRules.
  membershipNumber: (value) => {
    // Si quieres que sea opcional, descomenta la siguiente línea:
    // if (!value) return null;

    if (!value) return "El nro. de afiliado es requerido.";
    if (value.length < 3) return "Mínimo 3 caracteres.";
    // Regex simple para letras, números y guiones (ajustar según necesidad)
    const alphaNumericHyphen = /^[a-zA-Z0-9-]+$/;
    if (!alphaNumericHyphen.test(value))
      return "Solo letras, números y guiones.";

    return null;
  },

  // --- SECCIÓN 3: CONFIRMACIÓN (Modal) ---
  reason: (value) => {
    if (!value) return "El motivo de consulta es obligatorio.";
    const trimmedValue = value.trim();
    if (trimmedValue === "") return "El motivo de consulta es obligatorio.";
    if (trimmedValue.length < 5)
      return "El motivo es muy corto (mínimo 5 caracteres).";
    return null;
  },
};
