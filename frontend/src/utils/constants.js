const ROLES = {
  Admin: "Secretarío/a",
  Doctor: "Médico/a",
  Patient: "Paciente",
};

export default ROLES;

export const REGEX = {
  name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  lastname: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  dni: /^\d{7,8}$/,
  phone: /^[\d\s-]{10,15}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\S]{8,}$/,
};

export const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];