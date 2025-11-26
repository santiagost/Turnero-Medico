import {
  addDays,
  setHours,
  setMinutes,
  format,
  startOfWeek,
  subWeeks,
  isSameDay,
  parseISO,
} from "date-fns";

/**
 * =================================================================
 * MOCK DATA (Datos Falsos para Pruebas)
 * =================================================================
 */

// -----------------------------------------------------------------
// 1. ENTIDADES BASE
// -----------------------------------------------------------------

export const mockSpecialties = [
  { specialtyId: 1, name: "Traumatología y Ortopedia", description: "Tratamiento de lesiones del sistema musculoesquelético." },
  { specialtyId: 2, name: "Cardiología", description: "Estudio y tratamiento de enfermedades del corazón." },
  { specialtyId: 3, name: "Dermatología", description: "Cuidado de la piel, cabello y uñas." },
  { specialtyId: 4, name: "Clínica Médica", description: "Atención primaria, diagnóstico general y prevención." },
  { specialtyId: 5, name: "Kinesiología", description: "Rehabilitación física y terapia de movimiento." },
];

export const specialtyOptions = mockSpecialties.map((specialty) => ({
  value: specialty.specialtyId,
  label: specialty.name,
}));

export const mockSocialWorks = [
  { socialWorkId: 1, name: "OSDE", cuit: "30-12345678-9", direction: "Av. Siempre Viva 123", telephone: "0800-123-4567", email: "info@osde.com.ar" },
  { socialWorkId: 2, name: "Swiss Medical", cuit: "30-22334455-6", direction: "Calle Falsa 456", telephone: "0800-222-3333", email: "contacto@swissmedical.com.ar" },
  { socialWorkId: 3, name: "PAMI", cuit: "30-33445566-7", direction: "Av. Corrientes 789", telephone: "138", email: "info@pami.org.ar" },
  { socialWorkId: 4, name: "AFA", cuit: "30-44556677-8", direction: "Viamonte 1366", telephone: "4371-9400", email: "contacto@afa.com.ar" },
];

export const socialWorkOptions = mockSocialWorks.map((socialWork) => ({
  value: socialWork.socialWorkId,
  label: socialWork.name,
}));

export const mockShiftStatus = {
  pending: { statusId: 1, name: "Pendiente" },
  attended: { statusId: 2, name: "Atendido" },
  cancelled: { statusId: 3, name: "Cancelado" },
};

// --- Médicos (Doctors) ---
export const mockDoctor_Sanchez = { doctorId: 1, licenseNumber: "MP-12345", firstName: "Martin", lastName: "Sanchez", dni: "28111222", telephone: "3515551234", user: { userId: 2, email: "martin.sanchez@vitalis.com", createdAt: "2024-01-10T09:00:00", active: true, role: "Doctor" }, specialty: mockSpecialties[0] };
export const mockDoctor_Torres = { doctorId: 2, licenseNumber: "MP-22334", firstName: "Ana", lastName: "Torres", dni: "30222333", telephone: "3515554321", user: { userId: 102, email: "ana.torres@vitalis.com", createdAt: "2024-01-11T10:00:00", active: true, role: "Doctor" }, specialty: mockSpecialties[1] };
export const mockDoctor_Ruiz = { doctorId: 3, licenseNumber: "MP-33445", firstName: "Carlos", lastName: "Ruiz", dni: "29333444", telephone: "3515555678", user: { userId: 103, email: "carlos.ruiz@vitalis.com", createdAt: "2024-01-12T11:00:00", active: true, role: "Doctor" }, specialty: mockSpecialties[2] };
export const mockDoctor_Fernandez = { doctorId: 4, licenseNumber: "MP-44556", firstName: "Lucía", lastName: "Fernandez", dni: "31444555", telephone: "3515558765", user: { userId: 104, email: "lucia.fernandez@vitalis.com", createdAt: "2024-01-13T12:00:00", active: true, role: "Doctor" }, specialty: mockSpecialties[3] };
export const mockDoctor_Gomez = { doctorId: 5, licenseNumber: "MP-55667", firstName: "Javier", lastName: "Gomez", dni: "27555666", telephone: "3515559999", user: { userId: 105, email: "javier.gomez@vitalis.com", createdAt: "2024-01-14T13:00:00", active: true, role: "Doctor" }, specialty: mockSpecialties[4] };
export const mockDoctor_Alvarez = { doctorId: 6, licenseNumber: "MP-66778", firstName: "Diego", lastName: "Alvarez", dni: "32666777", telephone: "3515551111", user: { userId: 106, email: "diego.alvarez@vitalis.com", createdAt: "2024-01-15T14:00:00", active: true, role: "Doctor" }, specialty: mockSpecialties[3] };
export const mockDoctor_Romero = { doctorId: 7, licenseNumber: "MP-77889", firstName: "Valentina", lastName: "Romero", dni: "33777888", telephone: "3515552222", user: { userId: 107, email: "valentina.romero@vitalis.com", createdAt: "2024-01-16T15:00:00", active: true, role: "Doctor" }, specialty: mockSpecialties[1] };
export const mockDoctor_Diaz = { doctorId: 8, licenseNumber: "MP-88990", firstName: "Bruno", lastName: "Diaz", dni: "34888999", telephone: "3515553333", user: { userId: 108, email: "bruno.diaz@vitalis.com", createdAt: "2024-01-17T16:00:00", active: true, role: "Doctor" }, specialty: mockSpecialties[2] };
export const mockDoctor_Sosa = { doctorId: 9, licenseNumber: "MP-99001", firstName: "Matias", lastName: "Sosa", dni: "35999000", telephone: "3515554444", user: { userId: 109, email: "matias.sosa@vitalis.com", createdAt: "2024-01-18T17:00:00", active: true, role: "Doctor" }, specialty: mockSpecialties[0] };
export const mockDoctor_Vargas = { doctorId: 10, licenseNumber: "MP-10112", firstName: "Camila", lastName: "Vargas", dni: "36111222", telephone: "3515555555", user: { userId: 110, email: "camila.vargas@vitalis.com", createdAt: "2024-01-19T18:00:00", active: true, role: "Doctor" }, specialty: mockSpecialties[4] };
export const mockDoctor_Perez = { doctorId: 11, licenseNumber: "MP-11223", firstName: "Lucas", lastName: "Perez", dni: "37222333", telephone: "3515556666", user: { userId: 111, email: "lucas.perez@vitalis.com", createdAt: "2024-01-20T19:00:00", active: true, role: "Doctor" }, specialty: mockSpecialties[3] };
export const mockDoctor_Moreno = { doctorId: 12, licenseNumber: "MP-12334", firstName: "Isabella", lastName: "Moreno", dni: "38333444", telephone: "3515557777", user: { userId: 112, email: "isabella.moreno@vitalis.com", createdAt: "2024-01-21T20:00:00", active: true, role: "Doctor" }, specialty: mockSpecialties[1] };

export const mockDoctors = [mockDoctor_Sanchez, mockDoctor_Torres, mockDoctor_Ruiz, mockDoctor_Fernandez, mockDoctor_Gomez, mockDoctor_Alvarez, mockDoctor_Romero, mockDoctor_Diaz, mockDoctor_Sosa, mockDoctor_Vargas, mockDoctor_Perez, mockDoctor_Moreno];

export const doctorOptions = mockDoctors.map((doctor) => ({ value: doctor.doctorId, label: `Dr/a. ${doctor.firstName} ${doctor.lastName}` }));

// --- Pacientes (Patients) ---
export const mockPatient_Garcia = { patientId: 2, firstName: "Emiliano", lastName: "García", dni: "11222333", telephone: "3884665015", birthDate: "1987-06-24", membershipNumber: "1111222233334444", user: { userId: 4, email: "emi.garcia@gmail.com", createdAt: "2024-05-15T14:30:00", active: true, role: "Patient" }, socialWork: mockSocialWorks[0] };
export const mockPatient_Martinez = { patientId: 1, firstName: "Sofía", lastName: "Martinez", dni: "22333444", telephone: "3511234567", birthDate: "1995-08-15", membershipNumber: "987654321001", user: { userId: 202, email: "sofia.martinez@gmail.com", createdAt: "2024-06-20T11:00:00", active: true, role: "Patient" }, socialWork: mockSocialWorks[1] };
export const mockPatient_Diaz = { patientId: 3, firstName: "Agustín", lastName: "Diaz", dni: "33444555", telephone: "3517654321", birthDate: "2000-02-10", membershipNumber: "A-123456-B", user: { userId: 203, email: "agus.diaz@hotmail.com", createdAt: "2024-07-01T16:00:00", active: true, role: "Patient" }, socialWork: mockSocialWorks[2] };
export const mockPatient_Gomez = { patientId: 4, firstName: "Valentina", lastName: "Gomez", dni: "44555666", telephone: "3512223333", birthDate: "2003-11-20", membershipNumber: "777888999", user: { userId: 204, email: "vale.gomez@yahoo.com", createdAt: "2024-08-10T17:00:00", active: true, role: "Patient" }, socialWork: mockSocialWorks[0] };
export const mockPatient_Lionel_Messi = { patientId: 5, firstName: "Lionel", lastName: "Messi", dni: "30123456", telephone: "3411010101", birthDate: "1987-06-24", membershipNumber: "1010101010-01", user: { userId: 205, email: "lio.messi@gmail.com", createdAt: "2024-09-01T10:00:00", active: true, role: "Patient" }, socialWork: mockSocialWorks[3] };
export const mockPatient_Garcia_NoSocial = { patientId: 6, firstName: "Martin", lastName: "García", dni: "11222334", telephone: "3884665016", birthDate: "1987-06-24", membershipNumber: "", user: { userId: 206, email: "marto.garcia2@gmail.com", createdAt: "2024-05-15T14:30:00", active: true, role: "Patient" }, socialWork: null };
export const mockPatient_Thiago_Messi = { patientId: 7, firstName: "Thiago", lastName: "Messi", dni: "55123456", telephone: "3411010102", birthDate: "2012-11-02", membershipNumber: "1010101010-02", user: { userId: 207, email: "thiago.messi@gmail.com", createdAt: "2024-09-01T10:00:00", active: true, role: "Patient" }, socialWork: mockSocialWorks[3] };
export const mockPatient_Rodriguez = { patientId: 8, firstName: "Carla", lastName: "Rodriguez", dni: "38999888", telephone: "3516667777", birthDate: "1999-01-20", membershipNumber: "R-987654", user: { userId: 208, email: "carla.rod@gmail.com", createdAt: "2024-10-01T08:00:00", active: true, role: "Patient" }, socialWork: mockSocialWorks[1] };
export const mockPatient_Perez = { patientId: 9, firstName: "Juan", lastName: "Perez", dni: "25111222", telephone: "3518889999", birthDate: "1980-03-30", membershipNumber: "777-123", user: { userId: 209, email: "jperez@hotmail.com", createdAt: "2024-10-05T09:15:00", active: true, role: "Patient" }, socialWork: mockSocialWorks[2] };
export const mockPatient_Lopez = { patientId: 10, firstName: "Maria", lastName: "Lopez", dni: "31222333", telephone: "3511112222", birthDate: "1988-07-14", membershipNumber: "", user: { userId: 210, email: "marialopez@gmail.com", createdAt: "2024-10-10T14:00:00", active: true, role: "Patient" }, socialWork: null };
export const mockPatient_Gonzalez = { patientId: 11, firstName: "Lucas", lastName: "Gonzalez", dni: "40333444", telephone: "3513334444", birthDate: "2001-12-01", membershipNumber: "G-456789", user: { userId: 211, email: "lucas.gonzalez@gmail.com", createdAt: "2024-10-15T11:30:00", active: true, role: "Patient" }, socialWork: mockSocialWorks[0] };
export const mockPatient_Fernandez = { patientId: 12, firstName: "Julieta", lastName: "Fernandez", dni: "37444555", telephone: "3514445555", birthDate: "1998-05-22", membershipNumber: "F-111111", user: { userId: 212, email: "juli.fernandez@gmail.com", createdAt: "2024-10-20T18:00:00", active: true, role: "Patient" }, socialWork: mockSocialWorks[1] };

export const mockPatients = [mockPatient_Garcia, mockPatient_Martinez, mockPatient_Diaz, mockPatient_Gomez, mockPatient_Lionel_Messi, mockPatient_Garcia_NoSocial, mockPatient_Thiago_Messi, mockPatient_Rodriguez, mockPatient_Perez, mockPatient_Lopez, mockPatient_Gonzalez, mockPatient_Fernandez];

export const mockAdmin_Diaz = { adminId: 1, firstName: "Agustín", lastName: "Diaz", dni: "33444555", telephone: "3517654321", birthDate: "2000-02-10", user: { userId: 301, email: "agus.diaz@vitalis.com", createdAt: "2024-01-09T08:00:00", active: true, role: "Admin" } };

// -----------------------------------------------------------------
// 2. DATOS RELACIONALES (Fechas relativas)
// -----------------------------------------------------------------

const today = new Date();
const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); 
const nextWeekStart = addDays(currentWeekStart, 7); 
const lastWeekStart = subWeeks(currentWeekStart, 1); 

/**
 * VISIÓN DOCTOR: Lista de turnos para el Dr. SANCHEZ
 */
export const doctorScheduleMock = [
  // --- SEMANA PASADA (ATENDIDOS) ---
  { shiftId: 801, startTime: format(setMinutes(setHours(lastWeekStart, 9), 0), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(lastWeekStart, 9), 30), "yyyy-MM-dd'T'HH:mm:00"), reason: "Dolor crónico rodilla.", status: mockShiftStatus.attended, doctor: mockDoctor_Sanchez, patient: mockPatient_Garcia },
  { shiftId: 802, startTime: format(setMinutes(setHours(lastWeekStart, 9), 30), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(lastWeekStart, 10), 0), "yyyy-MM-dd'T'HH:mm:00"), reason: "Consulta primera vez - Dolor lumbar.", status: mockShiftStatus.attended, doctor: mockDoctor_Sanchez, patient: mockPatient_Martinez },
  { shiftId: 803, startTime: format(setMinutes(setHours(lastWeekStart, 10), 0), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(lastWeekStart, 10), 30), "yyyy-MM-dd'T'HH:mm:00"), reason: "Revisión post-fractura muñeca.", status: mockShiftStatus.attended, doctor: mockDoctor_Sanchez, patient: mockPatient_Diaz },
  { shiftId: 804, startTime: format(setMinutes(setHours(addDays(lastWeekStart, 2), 14), 0), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(addDays(lastWeekStart, 2), 14), 30), "yyyy-MM-dd'T'HH:mm:00"), reason: "Molestia en el hombro al nadar.", status: mockShiftStatus.attended, doctor: mockDoctor_Sanchez, patient: mockPatient_Gomez },
  { shiftId: 805, startTime: format(setMinutes(setHours(addDays(lastWeekStart, 2), 14), 30), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(addDays(lastWeekStart, 2), 15), 0), "yyyy-MM-dd'T'HH:mm:00"), reason: "Control esguince tobillo.", status: mockShiftStatus.attended, doctor: mockDoctor_Sanchez, patient: mockPatient_Rodriguez },
  { shiftId: 103, startTime: format(setMinutes(setHours(addDays(lastWeekStart, 4), 11), 0), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(addDays(lastWeekStart, 4), 11), 30), "yyyy-MM-dd'T'HH:mm:00"), reason: "Urgencia por caída en bicicleta.", status: mockShiftStatus.attended, doctor: mockDoctor_Sanchez, patient: mockPatient_Perez },

  // --- SEMANA ACTUAL (PENDIENTES/CANCELADOS) ---
  { shiftId: 101, startTime: format(setMinutes(setHours(currentWeekStart, 9), 0), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(currentWeekStart, 9), 30), "yyyy-MM-dd'T'HH:mm:00"), reason: "Dolor persistente en rodilla derecha.", status: mockShiftStatus.pending, doctor: mockDoctor_Sanchez, patient: mockPatient_Garcia },
  { shiftId: 901, startTime: format(setMinutes(setHours(currentWeekStart, 9), 30), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(currentWeekStart, 10), 0), "yyyy-MM-dd'T'HH:mm:00"), reason: "Consulta pre-quirúrgica.", status: mockShiftStatus.pending, doctor: mockDoctor_Sanchez, patient: mockPatient_Perez },
  { shiftId: 902, startTime: format(setMinutes(setHours(currentWeekStart, 10), 0), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(currentWeekStart, 10), 30), "yyyy-MM-dd'T'HH:mm:00"), reason: "Paciente canceló telefónicamente.", status: mockShiftStatus.cancelled, doctor: mockDoctor_Sanchez, patient: mockPatient_Lopez },
  { shiftId: 102, startTime: format(setMinutes(setHours(addDays(currentWeekStart, 2), 10), 0), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(addDays(currentWeekStart, 2), 10), 30), "yyyy-MM-dd'T'HH:mm:00"), reason: "Control de rutina.", status: mockShiftStatus.pending, doctor: mockDoctor_Sanchez, patient: mockPatient_Garcia },
  { shiftId: 903, startTime: format(setMinutes(setHours(addDays(currentWeekStart, 2), 10), 30), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(addDays(currentWeekStart, 2), 11), 0), "yyyy-MM-dd'T'HH:mm:00"), reason: "Dolor cervical intenso.", status: mockShiftStatus.pending, doctor: mockDoctor_Sanchez, patient: mockPatient_Fernandez },
  { shiftId: 904, startTime: format(setMinutes(setHours(addDays(currentWeekStart, 2), 11), 0), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(addDays(currentWeekStart, 2), 11), 30), "yyyy-MM-dd'T'HH:mm:00"), reason: "Traumatismo en dedo meñique.", status: mockShiftStatus.pending, doctor: mockDoctor_Sanchez, patient: mockPatient_Gonzalez },
  { shiftId: 104, startTime: format(setMinutes(setHours(addDays(currentWeekStart, 3), 15), 0), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(addDays(currentWeekStart, 3), 15), 30), "yyyy-MM-dd'T'HH:mm:00"), reason: "Consulta primera vez.", status: mockShiftStatus.pending, doctor: mockDoctor_Sanchez, patient: mockPatient_Martinez },
  { shiftId: 106, startTime: format(setMinutes(setHours(addDays(currentWeekStart, 3), 15), 30), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(addDays(currentWeekStart, 3), 16), 0), "yyyy-MM-dd'T'HH:mm:00"), reason: "Retiro de puntos.", status: mockShiftStatus.pending, doctor: mockDoctor_Sanchez, patient: mockPatient_Lionel_Messi },
  { shiftId: 107, startTime: format(setMinutes(setHours(addDays(currentWeekStart, 3), 16), 30), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(addDays(currentWeekStart, 3), 17), 0), "yyyy-MM-dd'T'HH:mm:00"), reason: "Urgencia.", status: mockShiftStatus.cancelled, doctor: mockDoctor_Sanchez, patient: mockPatient_Garcia },

  // --- FUTURO ---
  { shiftId: 105, startTime: format(setMinutes(setHours(nextWeekStart, 9), 0), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(nextWeekStart, 9), 30), "yyyy-MM-dd'T'HH:mm:00"), reason: "Revisión de estudios.", status: mockShiftStatus.pending, doctor: mockDoctor_Sanchez, patient: mockPatient_Garcia },
  { shiftId: 905, startTime: format(setMinutes(setHours(nextWeekStart, 9), 30), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(nextWeekStart, 10), 0), "yyyy-MM-dd'T'HH:mm:00"), reason: "Control anual.", status: mockShiftStatus.pending, doctor: mockDoctor_Sanchez, patient: mockPatient_Diaz },
];

/**
 * VISIÓN PACIENTE: Lista de turnos para el Paciente GARCIA
 */
export const patientScheduleMock = [
  { shiftId: 901, startTime: format(setMinutes(setHours(addDays(today, 1), 9), 30), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(addDays(today, 1), 10), 0), "yyyy-MM-dd'T'HH:mm:00"), reason: "Control post-operatorio (Mock Mañana).", status: mockShiftStatus.pending, doctor: mockDoctor_Sanchez, patient: mockPatient_Garcia },
  { shiftId: 902, startTime: format(setMinutes(setHours(addDays(today, 2), 16), 0), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(addDays(today, 2), 16), 30), "yyyy-MM-dd'T'HH:mm:00"), reason: "Chequeo general (Mock Pasado Mañana).", status: mockShiftStatus.pending, doctor: mockDoctor_Torres, patient: mockPatient_Garcia },
  { shiftId: 903, startTime: format(setMinutes(setHours(addDays(today, 15), 15), 0), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(addDays(today, 15), 15), 30), "yyyy-MM-dd'T'HH:mm:00"), reason: "Chequeo mensual (Mock Futuro Lejano).", status: mockShiftStatus.pending, doctor: mockDoctor_Fernandez, patient: mockPatient_Garcia },
  { shiftId: 110, startTime: format(setMinutes(setHours(nextWeekStart, 9), 0), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(nextWeekStart, 9), 30), "yyyy-MM-dd'T'HH:mm:00"), reason: "Revisión de estudios.", status: mockShiftStatus.pending, doctor: mockDoctor_Moreno, patient: mockPatient_Garcia },
  { shiftId: 102, startTime: format(setMinutes(setHours(addDays(currentWeekStart, 2), 10), 0), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(addDays(currentWeekStart, 2), 10), 30), "yyyy-MM-dd'T'HH:mm:00"), reason: "Control de rutina.", status: mockShiftStatus.pending, doctor: mockDoctor_Sanchez, patient: mockPatient_Garcia },
  { shiftId: 103, startTime: format(setMinutes(setHours(addDays(lastWeekStart, 4), 11), 0), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(addDays(lastWeekStart, 4), 11), 30), "yyyy-MM-dd'T'HH:mm:00"), reason: "Urgencia por caída en bicicleta.", status: mockShiftStatus.attended, doctor: mockDoctor_Sanchez, patient: mockPatient_Perez },
  { shiftId: 201, startTime: format(setMinutes(setHours(addDays(lastWeekStart, 1), 16), 0), "yyyy-MM-dd'T'HH:mm:00"), endTime: format(setMinutes(setHours(addDays(lastWeekStart, 1), 16), 30), "yyyy-MM-dd'T'HH:mm:00"), reason: "Chequeo cardiológico anual.", status: mockShiftStatus.attended, doctor: mockDoctor_Torres, patient: mockPatient_Garcia },
];

// -----------------------------------------------------------------
// 3. BUSCADOR UNIFICADO DE TURNOS
// -----------------------------------------------------------------
// Busca en ambos schedules para evitar errores de referencia nula
const findShiftById = (id) => {
  const inDoctor = doctorScheduleMock.find((s) => s.shiftId === id);
  if (inDoctor) return inDoctor;
  
  const inPatient = patientScheduleMock.find((s) => s.shiftId === id);
  if (inPatient) return inPatient;
  
  return null; 
};

// -----------------------------------------------------------------
// 4. CONSULTAS COMPLETADAS (Master Array)
// -----------------------------------------------------------------
export const completedConsultationsMock = [
  // -- 1. Turno 801: Garcia (Lunes pasado 09:00) - Rodilla Crónica --
  {
    consultationId: 601,
    consultationDate: format(setMinutes(setHours(lastWeekStart, 9), 15), "yyyy-MM-dd'T'HH:mm:00"),
    diagnosis: "Gonartrosis incipiente rodilla derecha",
    treatment: "Kinesiología (10 sesiones), bajar de peso, evitar impacto.",
    personalNotes: "El paciente refiere que el dolor aumenta con los cambios de clima. Movilidad reducida en flexión máxima.",
    medications: [
      { prescriptionId: 1001, name: "Glucosamina + Condroitina", dosage: "1 sobre diario", instructions: "Tomar por 3 meses y reevaluar.", issueDate: format(setMinutes(setHours(lastWeekStart, 9), 20), "yyyy-MM-dd'T'HH:mm:00") }
    ],
    shift: findShiftById(801),
  },

  // -- 2. Turno 802: Martinez (Lunes pasado 09:30) - Dolor Lumbar --
  {
    consultationId: 602,
    consultationDate: format(setMinutes(setHours(lastWeekStart, 9), 45), "yyyy-MM-dd'T'HH:mm:00"),
    diagnosis: "Contractura muscular paravertebral",
    treatment: "Calor seco, relajante muscular por 3 días.",
    personalNotes: "Paciente con mala postura laboral (home office sin silla ergonómica). Se indican pausas activas.",
    medications: [
      { prescriptionId: 1002, name: "Pridinol 4mg", dosage: "1 comprimido cada 12hs", instructions: "Si produce somnolencia, tomar solo por la noche.", issueDate: format(setMinutes(setHours(lastWeekStart, 9), 50), "yyyy-MM-dd'T'HH:mm:00") }
    ],
    shift: findShiftById(802),
  },

  // -- 3. Turno 803: Diaz (Lunes pasado 10:00) - Revisión Muñeca --
  {
    consultationId: 603,
    consultationDate: format(setMinutes(setHours(lastWeekStart, 10), 15), "yyyy-MM-dd'T'HH:mm:00"),
    diagnosis: "Consolidación ósea adecuada",
    treatment: "Alta traumatológica. Inicio de fortalecimiento progresivo.",
    personalNotes: "Radiografía de control muestra callo óseo bien formado en radio distal. Puede retomar actividad física liviana.",
    medications: [],
    shift: findShiftById(803),
  },

  // -- 4. Turno 804: Gomez (Miércoles pasado 14:00) - Hombro Nadador --
  {
    consultationId: 604,
    consultationDate: format(setMinutes(setHours(addDays(lastWeekStart, 2), 14), 15), "yyyy-MM-dd'T'HH:mm:00"),
    diagnosis: "Tendinopatía del manguito rotador",
    treatment: "Reposo deportivo (natación) por 15 días. RPG.",
    personalNotes: "Dolor positivo en maniobra de Neer y Hawkins. Se solicita ecografía de partes blandas para descartar ruptura parcial.",
    medications: [
      { prescriptionId: 1003, name: "Diclofenac 75mg", dosage: "1 comprimido cada 12hs", instructions: "Por 5 días máximo. Acompañar con protector gástrico.", issueDate: format(setMinutes(setHours(addDays(lastWeekStart, 2), 14), 20), "yyyy-MM-dd'T'HH:mm:00") }
    ],
    shift: findShiftById(804),
  },

  // -- 5. Turno 805: Rodriguez (Miércoles pasado 14:30) - Esguince Tobillo --
  {
    consultationId: 605,
    consultationDate: format(setMinutes(setHours(addDays(lastWeekStart, 2), 14), 45), "yyyy-MM-dd'T'HH:mm:00"),
    diagnosis: "Esguince tobillo izquierdo Grado 1",
    treatment: "Uso de tobillera de neoprene, carga parcial.",
    personalNotes: "Evolución muy favorable. Ya no presenta edema significativo. Se autoriza caminar sin muletas.",
    medications: [],
    shift: findShiftById(805),
  },

  // -- 6. Turno 103: Perez (Viernes pasado 11:00) - Urgencia Bici --
  {
    consultationId: 501,
    consultationDate: format(setMinutes(setHours(addDays(lastWeekStart, 4), 11), 15), "yyyy-MM-dd'T'HH:mm:00"),
    diagnosis: "Traumatismo superficial de rodilla",
    treatment: "Reposo deportivo (7 días), hielo local.",
    personalNotes: "Paciente refiere caída en bicicleta. No hay fractura visible, solo contusión e inflamación.",
    medications: [
      { prescriptionId: 901, name: "Ibuprofeno 600mg", dosage: "1 cada 8 horas", instructions: "Tomar con alimentos. Suspender si hay dolor estomacal.", issueDate: format(setMinutes(setHours(addDays(lastWeekStart, 4), 11), 20), "yyyy-MM-dd'T'HH:mm:00") },
    ],
    shift: findShiftById(103),
  },
  
  // -- 7. Turno 201: Garcia con Torres (Cardiología) --
  {
    consultationId: 502,
    consultationDate: format(setMinutes(setHours(addDays(lastWeekStart, 1), 16), 20), "yyyy-MM-dd'T'HH:mm:00"),
    diagnosis: "Apto Físico - Cardiovascular Normal",
    treatment: "Control anual preventivo.",
    personalNotes: "Electrocardiograma normal. Presión arterial 120/80. Se firma apto físico para voley competitivo.",
    medications: [],
    shift: findShiftById(201),
  },
];

export const getConsultationByShiftId = (shiftId) => {
  return completedConsultationsMock.find((c) => c.shift && c.shift.shiftId === shiftId) || null;
};

export const getMockDoctorSchedule = (viewedMondayDate) => {
  // Esta función sigue siendo necesaria para la UI del calendario dinámico
  // Retornamos el mock estático del Doctor Sanchez filtrado o procesado si fuera necesario,
  // pero por ahora retornamos el array completo para simplicidad en la demo.
  return doctorScheduleMock; 
};

export const mockDoctorAvailability = [
  { dayOfWeek: 1, startTime: "09:00", endTime: "14:00", durationMinutes: 30 },
  { dayOfWeek: 2, startTime: "12:00", endTime: "16:00", durationMinutes: 30 },
  { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", durationMinutes: 30 },
  { dayOfWeek: 4, startTime: "10:30", endTime: "17:00", durationMinutes: 30 },
  { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", durationMinutes: 30 },
];