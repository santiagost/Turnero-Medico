const ROLES = {
  Admin: "Secretarío/a",
  Doctor: "Médico/a",
  Patient: "Paciente",
};

export default ROLES;

// --- Expresiones Regulares ---
export const REGEX = {
  // Acepta letras, espacios y acentos (mínimo 2 caracteres)
  name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/,

  // Formato de email estándar
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // DNI: 7 u 8 dígitos numéricos, sin puntos
  dni: /^\d{7,8}$/,

  // Teléfono: 10 a 13 dígitos (para cubrir celulares, etc.)
  phone: /^\d{10,13}$/,

  // Contraseña: Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\S]{8,}$/,
};

// --- Esquema de Registro ---
export const registerValidationSchema = {
  name: (value) => {
    if (!value) return "El nombre es requerido.";
    if (!REGEX.name.test(value)) return "Nombre inválido (solo letras).";
    return null;
  },
  lastname: (value) => {
    if (!value) return "El apellido es requerido.";
    if (!REGEX.name.test(value)) return "Apellido inválido (solo letras).";
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
  birthDate: (value) => {
    if (!value) return "La fecha es requerida.";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = value.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    if (selectedDate > today) {
      return "La fecha no puede ser futura.";
    }
    return null;
  },
  email: (value) => {
    if (!value) return "El correo es requerido.";
    if (!REGEX.email.test(value)) return "Formato de correo inválido.";
    return null;
  },
  confirmEmail: (value, formData) => {
    if (value !== formData.email) return "Los correos no coinciden.";
    return null;
  },
  password: (value) => {
    if (!value) return "La contraseña es requerida.";
    if (!REGEX.password.test(value))
      return "Mín. 8 caracteres, 1 mayús., 1 minús. y 1 núm.";
    return null;
  },
  confirmPassword: (value, formData) => {
    if (value !== formData.password) return "Las contraseñas no coinciden.";
    return null;
  },
};

// --- Esquema de Login ---
export const loginValidationSchema = {
  email: (value) => {
    if (!value) return "El correo es requerido.";
    if (!REGEX.email.test(value)) return "Formato de correo inválido.";
    return null;
  },
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
  email: (value) => {
    if (!value) return "El correo es requerido.";
    if (!REGEX.email.test(value)) return "Formato de correo inválido.";
    return null;
  },
};

// --- Lógica de Edición de Perfil ---
const editValidationRules = {
  telephone: (value) => {
    if (!value) return "El teléfono es requerido.";
    if (!REGEX.phone.test(value)) return "Teléfono inválido (10-13 números).";
    return null;
  },
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

// --- Esquema de Seguridad (Cambiar Contraseña) ---
export const securityValidationSchema = {
  currentPassword: (value) => {
    if (!value) return "La contraseña actual es requerida.";
    return null;
  },
  newPassword: (value) => {
    if (!value) return "La nueva contraseña es requerida.";
    if (!REGEX.password.test(value))
      return "Mín. 8 caracteres, 1 mayús., 1 minús. y 1 núm.";
    return null;
  },
  confirmPassword: (value, formData) => {
    if (value !== formData.newPassword) return "Las contraseñas no coinciden.";
    return null;
  },
};


// --- Esquema de Medicamentos ---
export const medicationValidationSchema = {
  name: (value) => {
    if (!value) return "El nombre es requerido.";
    return null;
  },
  dosage: (value) => {
    if (!value) return "La dosis es requerida.";
    return null;
  },
  instructions: (value) => {
    return null;
  }
};

// --- Esquema para crear un nuevo paciente por el Admin ---
export const adminCreatePatientSchema = {
    // Reutilizamos las reglas de registro
    firstName: registerValidationSchema.name, // Reusa la regla 'name' pero la asigna a 'firstName'
    lastName: registerValidationSchema.lastname, // Reusa la regla 'lastname'
    dni: registerValidationSchema.dni,
    telephone: registerValidationSchema.telephone,
    birthDate: registerValidationSchema.birthDate,
    email: registerValidationSchema.email,
    
    // Reutilizamos las reglas de edición
    membershipNumber: editValidationRules.membershipNumber,
    socialWorkId: editValidationRules.socialWork, // La prop en tu form es 'socialWorkId'
};

// --- NUEVO: Esquema de Creación de Médico por Admin ---
export const adminCreateDoctorSchema = {
    // Reutilizamos reglas
    firstName: registerValidationSchema.name,
    lastName: registerValidationSchema.lastname,
    dni: registerValidationSchema.dni,
    telephone: registerValidationSchema.telephone,
    email: registerValidationSchema.email,
    
    // Reglas específicas de Médico
    licenseNumber: (value) => {
        if (!value) return "La matrícula es requerida.";
        // (Podrías añadir una REGEX específica para matrículas si quieres)
        return null;
    },
    specialtyId: (value) => {
        if (!value) return "La especialidad es requerida.";
        return null;
    }
};

export const adminCreateSocialWorkSchema = {
    name: (value) => {
        if (!value) return "El nombre es requerido.";
        if (value.length < 3) return "El nombre debe tener al menos 3 caracteres.";
        return null;
    },
    cuit: (value) => {
        if (!value) return "El CUIT es requerido.";
        // Regex básica para CUIT argentino (XX-XXXXXXXX-X)
        if (!/^\d{2}-\d{8}-\d{1}$/.test(value)) return "El CUIT debe tener el formato XX-XXXXXXXX-X.";
        return null;
    },
    telephone: (value) => {
        if (!value) return "El teléfono es requerido.";
        if (!/^\d{10,}$/.test(value.replace(/\D/g, ''))) return "El teléfono debe contener solo números y al menos 10 dígitos.";
        return null;
    },
    address: (value) => {
        if (!value) return "La dirección es requerida.";
        if (value.length < 5) return "La dirección debe tener al menos 5 caracteres.";
        return null;
    },
    email: (value) => {
        if (!value) return "El correo electrónico es requerido.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Formato de correo electrónico inválido.";
        return null;
    },
};

export const adminCreateSpecialtySchema = {
    name: (value) => {
        if (!value) return "El nombre es requerido.";
        if (value.length < 3) return "Debe tener al menos 3 caracteres.";
        return null;
    },
    description: (value) => {
        if (!value) return "La descripción es requerida.";
        if (value.length < 10) return "La descripción debe tener al menos 10 caracteres.";
        return null;
    }
};

export const calculateAge = (dateString) => {
  if (!dateString) {
    return null;
  }

  const today = new Date();
  const [year, month, day] = dateString.split("-").map(Number);
  const birthDate = new Date(year, month - 1, day); // El mes en JS es 0-indexado

  let age = today.getFullYear() - birthDate.getFullYear();

  const todayMonth = today.getMonth();
  const birthMonth = birthDate.getMonth();
  const todayDay = today.getDate();
  const birthDay = birthDate.getDate();

  if (
    todayMonth < birthMonth ||
    (todayMonth === birthMonth && todayDay < birthDay)
  ) {
    age--;
  }

  return age;
};


export const estimateDate = (dateString) => {
  // Si la fecha no existe o ya es "Hoy" o "Mañana", devuélvela tal cual.
  if (!dateString || dateString === "Hoy" || dateString === "Mañana") {
    return dateString;
  }

  // --- Lógica de parseo y comparación ---

  // 1. Parsear la fecha de entrada (yyyy-MM-dd)
  const [year, month, day] = dateString.split("-").map(Number);
  // Valida que el formato sea correcto
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return dateString; // Devuelve el string original si no es 'yyyy-MM-dd'
  }
  const inputDate = new Date(year, month - 1, day);
  inputDate.setHours(0, 0, 0, 0); // Ignorar la hora

  // 2. Obtener la fecha de hoy (sin hora)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 3. Obtener la fecha de mañana (sin hora)
  const tomorrow = new Date(today); // Clona 'today'
  tomorrow.setDate(today.getDate() + 1);

  // 4. Comparar usando los timestamps (getTime())
  if (inputDate.getTime() === today.getTime()) {
    return "Hoy";
  }

  if (inputDate.getTime() === tomorrow.getTime()) {
    return "Mañana";
  }

  // 5. Si no es hoy ni mañana, devuelve la fecha en formato legible "dd/MM/yyyy"
  // Esto es mejor que devolver "2025-11-05"
  return `${String(day).padStart(2, "0")}/${String(month).padStart(
    2,
    "0"
  )}/${year}`;
};


export const getFormattedDate = (isoString) => {
    if (!isoString) return null;
    try {
        return isoString.split('T')[0];
    } catch (error) {
        console.error("Error al formatear la fecha:", error);
        return null;
    }
};

/**
 * Extrae la hora en formato "hh:mm hs" (Argentina) de un string ISO.
 * @param {string} isoString - (ej: "2025-11-03T09:30:00").
 * @returns {string | null} - La hora "09:30 hs" o null.
 */
export const getFormattedTime = (isoString) => {
    if (!isoString) return null;
    try {
        const dateObj = new Date(isoString);
        return dateObj.toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit'
        }) + ' hs';
    } catch (error) {
        console.error("Error al formatear la hora:", error);
        return null;
    }
};