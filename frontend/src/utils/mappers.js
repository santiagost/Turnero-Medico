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

// { "id_obra_social": 1, "nombre": "OSDE" }
export const mapSocialWorkOptionFromBackend = (item) => {
  if (!item) return {};
  return {
    value: item.id_obra_social,
    label: item.nombre,
  };
};

// PACIENTES

// { "id_paciente": 1, "dni": "123", "nombre": "Juan", "apellido": "Perez", "telefono": "...", "fecha_nacimiento": "...", "id_obra_social": 1, "nro_afiliado": "..." }
export const mapPatientFromBackend = (item) => {
  if (!item) return {};

  return {
    patientId: item.id_paciente,
    dni: item.dni,
    firstName: item.nombre,
    lastName: item.apellido,
    telephone: item.telefono,
    birthDate: item.fecha_nacimiento,
    userId: item.id_usuario, // Puede venir nulo si no está vinculado
    socialWork: {
      socialWorkId: item.obra_social.id_obra_social,
      name: item.obra_social.nombre,
    },
    membershipNumber: item.nro_afiliado,
    emailNotificationActive: item.noti_reserva_email_act
  };
};

// { "id_paciente": 1, "dni": "123", "nombre": "Juan", "apellido": "Perez", }
export const mapMyPatients = (item) => {
  if (!item) return {};

  return {
    patientId: item.id_paciente,
    dni: item.dni,
    firstName: item.nombre,
    lastName: item.apellido,
  };
};


// MEDICOS

// { "id_medico": 1, "dni": "...", "nombre": "...", "apellido": "...", "matricula": "...", "telefono": "...", "id_usuario": 1, "id_especialidad": 2, "noti_cancel_email_act": 1 }
export const mapDoctorFromBackend = (item) => {
  if (!item) return {};

  return {
    doctorId: item.id_medico,
    dni: item.dni,
    firstName: item.nombre,
    lastName: item.apellido,
    licenseNumber: item.matricula,
    telephone: item.telefono,
    userId: item.id_usuario,
    specialty: {
      specialtyId: item.especialidad.id_especialidad,
      name: item.especialidad.nombre,
    },
    emailNotificationActive: item.noti_cancel_email_act
  };
};

// { "id_medico": 1, "nombre": "Juan", "apellido": "Perez" }
export const mapDoctorOptionFromBackend = (item) => {
  if (!item) return {};
  return {
    value: item.id_medico,
    label: `Dr.a ${item.apellido}, ${item.nombre}`,
  };
};


// CONSULTAS

// { "id_consulta": 1, "id_turno": 1, "fecha_consulta": "...", "diagnostico": "...", "notas_privadas_medico": "...", "tratamiento": "...", "turno": { ... } }
export const mapConsultationFromBackend = (item) => {
  if (!item) return {};

  // Mapeamos el objeto 'turno' anidado si existe
  const shiftData = item.turno ? mapShiftFromBackend(item.turno) : null;
  return {
    consultationId: item.id_consulta,
    shiftId: item.id_turno,
    consultationDate: item.fecha_consulta,
    diagnosis: item.diagnostico,
    personalNotes: item.notas_privadas_medico,
    treatment: item.tratamiento,
    shift: shiftData,
  };
};


// TURNOS

// { "shiftId": 1, "startTime": "2024-01-10 09:00:00", "reason": "Dolor en la pierna izquierda", "patient": { "firstName": "Lionel", "lastName": "Messi", "dni": "30001002", ... }, "doctor": { "firstName": "Gregory", "lastName": "House", "licenseNumber": "MN-555444", ... }, "status": { "name": "Cancelado", "statusId": 3 }
export const mapShiftFromBackend = (item) => {
  if (!item) return {};

  return {
    shiftId: item.id_turno,
    patientId: item.id_paciente,
    doctorId: item.id_medico,
    startTime: item.fecha_hora_inicio,
    endTime: item.fecha_hora_fin,
    reason: item.motivo_consulta,
    statusId: item.id_estado_turno,
    
    isBookingNotified: item.reserva_notificada,
    isReminderNotified: item.recordatorio_notificado,

    patient: item.paciente ? mapPatientFromBackend(item.paciente) : null,
    doctor: item.medico ? mapDoctorFromBackend(item.medico) : null,

    status: item.estado_turno ? {
      statusId: item.estado_turno.id_estado_turno,
      name: item.estado_turno.nombre,
      description: item.estado_turno.descripcion
    } : null
  };
};