const ROLES = {
  Admin: "Secretarío/a",
  Doctor: "Médico/a",
  Patient: "Paciente",
};

export default ROLES;

export const REGEX = {
  name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  dni: /^\d{7,8}$/,
  phone: /^\d{10,13}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\S]{8,}$/,
};

export const WEEKDAYS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];