import { commonRules } from "./commonRules";

export const newShiftSchema = {
    // Paso 1: Selección de profesional y horario
    specialty: commonRules.simpleRequired("especialidad"),
    doctor: commonRules.simpleRequired("médico"),
    date: commonRules.simpleRequired("fecha"),
    time: commonRules.simpleRequired("horario"),

    // Paso 2: Motivo (en el modal)
    reason: (value) => {
        if (!value || value.trim() === "") return "El motivo de consulta es obligatorio.";
        if (value.length < 5) return "El motivo es muy corto (mínimo 5 caracteres).";
        return null;
    }
};