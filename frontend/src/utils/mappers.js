const ROLE_MAP = {
    Admin: "Secretario",
    Doctor: "Medico",
    Patient: "Paciente",
};

export const mapFrontendRoleToBackend = (frontendRoleKey) => {
    return ROLE_MAP[frontendRoleKey] || frontendRoleKey;
};

export const mapBackendRoleToFrontend = (backendRoleName) => {
    const key = Object.keys(ROLE_MAP).find(key => ROLE_MAP[key] === backendRoleName);
    return key || backendRoleName; 
};

export const mapBackendDayToFrontend = (backendDay) => {
  return (backendDay + 1) % 7;
};

export const mapFrontendDayToBackend = (frontendDay) => {
  const day = Number(frontendDay);
  return (day + 6) % 7;
};

// USUARIOS

// { "email": "house@hospital.com", "id_usuario": 2, "activo": true, "recordatorios_activados": true }
export const mapUserFromBackend = (item) => {
  if (!item) return {};

  return {
    userId: item.id_usuario,
    email: item.email,
    isActive: item.activo,
    remindersActive: item.recordatorios_activados
  };
};

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
    user: item.usuario ? mapUserFromBackend(item.usuario) : null,
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
    user: item.usuario ? mapUserFromBackend(item.usuario) : null,
    specialty: item.especialidad ? mapSpecialtyFromBackend(item.especialidad) : null,
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


// ESTADISTICAS

//   { "total_turnos": 5, "turnos_atendidos": 0, "turnos_cancelados": 2, "turnos_pendientes": 0, "turnos_ausentes": 3, "pacientes_atendidos": 0 }
export const mapDailyStatsFromBackend = (item) => {
  if (!item) return {};
  return {
    totalShifts: item.total_turnos,
    attendedPatients: item.pacientes_atendidos,
    attendedShifts: item.turnos_atendidos,
    canceledShifts: item.turnos_cancelados,
    pendingShifts: item.turnos_pendientes,
    missedShifts: item.turnos_ausentes
  };
};



// { "id_turno": 1, "fecha": "2024-01-10", "hora": "09:00:00", "paciente": "Messi, Lionel", "obra_social": "OSDE", "estado": "Cancelado" }
export const mapMedicalPerformanceFromBackend = (item) => {
  if (!item) return {};
  return {
    shiftId: item.id_turno,
    date: item.fecha,
    time: item.hora,
    name: item.paciente,
    socialWork: item.obra_social,
    status: item.estado,
  };
};

// Mapper genérico para gráficos (Volumen, Asistencia, Especialidad)
export const mapChartDataFromBackend = (item) => {
  if (!item) return {};

  return {
    // Eje X: Agregamos 'item.dateLabel'
    label: item.dateLabel || item.especialidad || item.asistencias || item.label,
    
    // Eje Y: Agregamos 'item.pacientes'
    value: item.pacientes || item.cantidad || item.total_turnos || item.valor || item.value || 0,
    
    // Datos extra (si los hubiera)
    attended: item.asistencias || 0,
    absent: item.ausencias || 0,
  };
};

// HORARIOS DE ATENCION

// { "id_horario_atencion": 1, "id_medico": 10, "dia_semana": "Lunes", "hora_inicio": "09:00", "hora_fin": "13:00", "duracion_turno_min": 30 }
export const mapAvailabilityFromBackend = (item) => {
  if (!item) return {};

  return {
    availabilityId: item.id_horario_atencion,
    doctorId: item.id_medico,
    dayOfWeek: mapBackendDayToFrontend(item.dia_semana), 
    startTime: item.hora_inicio, // Formato "HH:MM"
    endTime: item.hora_fin,      // Formato "HH:MM"
    durationMinutes: item.duracion_turno_min,
    id: item.id_horario_atencion || Date.now() + Math.random() 
  };
};


