// ESPECIALIDADES

// { "nombre": "Cardiología", "id_especialidad": 1, "descripcion": "Enfermedades del corazón y sistema circulatorio" }
export const mapSpecialtyFromBackend = (item) => {
  if (!item) return {};
  const mappedSpecialty = {
    specialtyId: item.id_especialidad,
    name: item.nombre,
    description: item.descripcion,
  };
  return mappedSpecialty;
};

// { "id_especialidad": 1, "nombre": "Cardiología" }
export const mapSpecialtyOptionFromBackend = (item) => {
  if (!item) return {};
  const mappedOption = {
    value: item.id_especialidad,
    label: item.nombre,
  };
  return mappedOption;
};

// OBRA SOCIALES

// { "nombre": "OSDE", "id_obra_social": 1, "cuit": "30-54678923-1", "direccion": "Av. Madero 1020", "telefono": "0810-555-6733", "mail": "contacto@osde.com.ar" }
export const mapSocialWorkFromBackend = (item) => {
  if (!item) return {};

  return {
    socialWorkId: item.id_obra_social,
    name: item.nombre,
    cuit: item.cuit,
    address: item.direccion,
    telephone: item.telefono,
    email: item.mail,
  };
};

// Backend (Ligero): { "id_obra_social": 1, "nombre": "OSDE" }
export const mapSocialWorkOptionFromBackend = (item) => {
  if (!item) return {};
  return {
    value: item.id_obra_social,
    label: item.nombre,
  };
};
