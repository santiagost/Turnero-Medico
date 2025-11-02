const ROLES = {
        'Admin': 'Secretarío/a',
        'Doctor': 'Médico/a',
        'Patient': 'Paciente'
    }

export default ROLES;

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
    // 'value' vendrá como un string "yyyy-MM-dd" si usas type="date"
    if (!value) return "La fecha es requerida.";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = value.split('-').map(Number);
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
    if (!REGEX.password.test(value)) return "Mín. 8 caracteres, 1 mayús., 1 minús. y 1 núm.";
    return null;
  },
  confirmPassword: (value, formData) => {
    if (value !== formData.password) return "Las contraseñas no coinciden.";
    return null;
  }
};

export const loginValidationSchema = {
  email: (value) => {
    if (!value) return "El correo es requerido.";
    if (!REGEX.email.test(value)) return "Formato de correo inválido.";
    return null;
  },
  password: (value) => {
    if (!value) return "La contraseña es requerida.";
    // Nota: No validamos el formato en el login, solo que exista
    return null;
  },
  role: (value) => {
    if (!value) return "Debes seleccionar un rol.";
    return null;
  }
};

export const forgotPasswordValidationSchema = {
  email: (value) => {
    if (!value) return "El correo es requerido.";
    if (!REGEX.email.test(value)) return "Formato de correo inválido.";
    return null;
  }
};