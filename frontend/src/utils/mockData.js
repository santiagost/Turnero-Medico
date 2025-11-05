/**
 * =================================================================
 * MOCK DATA (Datos Falsos para Pruebas)
 * =================================================================
 * Basado en el DER de la aplicación.
 * Los datos se exportan de forma anidada (denormalizada)
 * para simular la respuesta de una API.
 * * ESTRUCTURA:
 * - Entidades Base (Pacientes, Médicos, etc.)
 * - Datos Relacionales (Turnos, Consultas)
 * =================================================================
 */

// -----------------------------------------------------------------
// 1. ENTIDADES BASE (Simulan las tablas principales)
// -----------------------------------------------------------------

export const mockSpecialties = [
    {
        specialtyId: 1,
        name: "Traumatología y Ortopedia",
        description: "Tratamiento de lesiones del sistema musculoesquelético."
    },
    {
        specialtyId: 2,
        name: "Cardiología",
        description: "Estudio y tratamiento de enfermedades del corazón."
    },
    {
        specialtyId: 3,
        name: "Dermatología",
        description: "Cuidado de la piel, cabello y uñas."
    },
    {
        specialtyId: 4,
        name: "Clínica Médica",
        description: "Atención primaria, diagnóstico general y prevención."
    },
    {
        specialtyId: 5,
        name: "Kinesiología",
        description: "Rehabilitación física y terapia de movimiento."
    }
];

export const specialtyOptions = mockSpecialties.map(specialty => ({
    value: specialty.specialtyId,
    label: specialty.name
}));

export const mockSocialWorks = [
    {
        socialWorkId: 1,
        name: "OSDE",
        cuit: "30-12345678-9",
        direction: "Av. Siempre Viva 123",
        telephone: "0800-123-4567",
        email: "info@osde.com.ar"
    },
    {
        socialWorkId: 2,
        name: "Swiss Medical",
        cuit: "30-22334455-6",
        direction: "Calle Falsa 456",
        telephone: "0800-222-3333",
        email: "contacto@swissmedical.com.ar"
    },
    {
        socialWorkId: 3,
        name: "PAMI",
        cuit: "30-33445566-7",
        direction: "Av. Corrientes 789",
        telephone: "138",
        email: "info@pami.org.ar"
    },
    {
        socialWorkId: 4,
        name: "AFA", // Ejemplo de obra social especial
        cuit: "30-44556677-8",
        direction: "Viamonte 1366",
        telephone: "4371-9400",
        email: "contacto@afa.com.ar"
    }
];

export const mockShiftStatus = {
    pending: { statusId: 1, name: "Pendiente" },
    attended: { statusId: 2, name: "Atendido" },
    cancelled: { statusId: 3, name: "Cancelado" }
};

// --- Médicos (Doctors) ---
// (Combinan 'Usuario', 'Medico' y 'Especialidad')

export const mockDoctor_Sanchez = {
    doctorId: 1,
    licenseNumber: "MP-12345", // Matrícula
    firstName: "Martin",
    lastName: "Sanchez",
    dni: "28111222",
    telephone: "3515551234",
    user: {
        userId: 101,
        email: "martin.sanchez@vitalis.com",
        createdAt: "2024-01-10T09:00:00",
        active: true,
        role: "Doctor"
    },
    specialty: mockSpecialties[0] // Traumatología
};

export const mockDoctor_Torres = {
    doctorId: 2,
    licenseNumber: "MP-22334",
    firstName: "Ana",
    lastName: "Torres",
    dni: "30222333",
    telephone: "3515554321",
    user: {
        userId: 102,
        email: "ana.torres@vitalis.com",
        createdAt: "2024-01-11T10:00:00",
        active: true,
        role: "Doctor"
    },
    specialty: mockSpecialties[1] // Cardiología
};

export const mockDoctor_Ruiz = {
    doctorId: 3,
    licenseNumber: "MP-33445",
    firstName: "Carlos",
    lastName: "Ruiz",
    dni: "29333444",
    telephone: "3515555678",
    user: {
        userId: 103,
        email: "carlos.ruiz@vitalis.com",
        createdAt: "2024-01-12T11:00:00",
        active: true,
        role: "Doctor"
    },
    specialty: mockSpecialties[2] // Dermatología
};

export const mockDoctor_Fernandez = {
    doctorId: 4,
    licenseNumber: "MP-44556",
    firstName: "Lucía",
    lastName: "Fernandez",
    dni: "31444555",
    telephone: "3515558765",
    user: {
        userId: 104,
        email: "lucia.fernandez@vitalis.com",
        createdAt: "2024-01-13T12:00:00",
        active: true,
        role: "Doctor"
    },
    specialty: mockSpecialties[3] // Clínica Médica
};

// Coleccion de Doctores
export const mockDoctors = [
    mockDoctor_Sanchez,
    mockDoctor_Torres,
    mockDoctor_Ruiz,
    mockDoctor_Fernandez,
]

export const doctorOptions = mockDoctors.map(doctor => ({
    value: doctor.doctorId,
    label: `Dr/a. ${doctor.firstName} ${doctor.lastName}`
}));

// --- Pacientes (Patients) ---
// (Combinan 'Usuario', 'Paciente' y 'ObraSocial')

export const mockPatient_Garcia = {
    patientId: 1,
    firstName: "Emiliano",
    lastName: "García",
    dni: "11222333",
    telephone: "3884665015",
    birthDate: "1987-06-24",
    membershipNumber: "1111222233334444",
    user: {
        userId: 201,
        email: "emi.garcia@gmail.com",
        createdAt: "2024-05-15T14:30:00",
        active: true,
        role: "Patient"
    },
    socialWork: mockSocialWorks[0] // OSDE
};

export const mockPatient_Martinez = {
    patientId: 2,
    firstName: "Sofía",
    lastName: "Martinez",
    dni: "22333444",
    telephone: "3511234567",
    birthDate: "1995-08-15",
    membershipNumber: "987654321001",
    user: {
        userId: 202,
        email: "sofia.martinez@gmail.com",
        createdAt: "2024-06-20T11:00:00",
        active: true,
        role: "Patient"
    },
    socialWork: mockSocialWorks[1] // Swiss Medical
};

export const mockPatient_Diaz = {
    patientId: 3,
    firstName: "Agustín",
    lastName: "Diaz",
    dni: "33444555",
    telephone: "3517654321",
    birthDate: "2000-02-10",
    membershipNumber: "A-123456-B",
    user: {
        userId: 203,
        email: "agus.diaz@hotmail.com",
        createdAt: "2024-07-01T16:00:00",
        active: true,
        role: "Patient"
    },
    socialWork: mockSocialWorks[2] // PAMI
};

export const mockPatient_Gomez = {
    patientId: 4,
    firstName: "Valentina",
    lastName: "Gomez",
    dni: "44555666",
    telephone: "3512223333",
    birthDate: "2003-11-20",
    membershipNumber: "777888999",
    user: {
        userId: 204,
        email: "vale.gomez@yahoo.com",
        createdAt: "2024-08-10T17:00:00",
        active: true,
        role: "Patient"
    },
    socialWork: mockSocialWorks[0] // OSDE
};

export const mockPatient_Messi = {
    patientId: 5,
    firstName: "Lionel",
    lastName: "Messi",
    dni: "30123456",
    telephone: "3411010101",
    birthDate: "1987-06-24",
    membershipNumber: "1010101010",
    user: {
        userId: 205,
        email: "lio.messi@gmail.com",
        createdAt: "2024-09-01T10:00:00",
        active: true,
        role: "Patient"
    },
    socialWork: mockSocialWorks[3] // AFA
};

// --- Paciente sin Obra Social ---
export const mockPatient_Garcia_NoSocial = {
    patientId: 6,
    firstName: "Emiliano",
    lastName: "García",
    dni: "11222333",
    telephone: "3884665015",
    birthDate: "1987-06-24",
    membershipNumber: "", // Vacío
    user: {
        userId: 201, // Podría ser el mismo user
        email: "emi.garcia@gmail.com",
        createdAt: "2024-05-15T14:30:00",
        active: true,
        role: "Patient"
    },
    socialWork: null // Nulo
};


// -----------------------------------------------------------------
// 2. DATOS RELACIONALES (Simulan respuestas de API)
// -----------------------------------------------------------------

/**
 * VISIÓN DOCTOR: Lista de turnos para UN médico (Dr. Sanchez)
 * (Equivalente a tu `initialDoctorScheduleMock` pero completo)
 * Nota: 'date' y 'time' se combinan en 'startTime' y 'endTime'
 */
export const doctorScheduleMock = [
    {
        shiftId: 1,
        startTime: "2025-11-03T09:30:00",
        endTime: "2025-11-03T10:00:00",
        reason: "Dolor en el hombro derecho por mal movimiento.",
        status: mockShiftStatus.pending,
        doctor: mockDoctor_Sanchez,
        patient: mockPatient_Garcia_NoSocial // Caso: Paciente SIN obra social
    },
    {
        shiftId: 2,
        startTime: "2025-11-03T10:15:00",
        endTime: "2025-11-03T10:45:00",
        reason: "Control post-cirugía de rodilla.",
        status: mockShiftStatus.pending,
        doctor: mockDoctor_Sanchez,
        patient: mockPatient_Martinez
    },
    {
        shiftId: 3,
        startTime: "2025-11-04T11:00:00",
        endTime: "2025-11-04T11:30:00",
        reason: "Revisión de yeso en muñeca.",
        status: mockShiftStatus.pending,
        doctor: mockDoctor_Sanchez,
        patient: mockPatient_Diaz
    },
    {
        shiftId: 4,
        startTime: "2025-10-29T15:00:00",
        endTime: "2025-10-29T15:30:00",
        reason: "Dolor lumbar agudo, posible pinzamiento.",
        status: mockShiftStatus.attended, // Caso: Turno ya atendido
        doctor: mockDoctor_Sanchez,
        patient: mockPatient_Gomez
    },
    {
        shiftId: 5,
        startTime: "2025-10-30T17:30:00",
        endTime: "2025-10-30T18:00:00",
        reason: "Consulta por lesión de rodilla.",
        status: mockShiftStatus.cancelled, // Caso: Turno cancelado
        doctor: mockDoctor_Sanchez,
        patient: mockPatient_Messi
    }
];

/**
 * VISIÓN PACIENTE: Lista de turnos para UN paciente (Lionel Messi)
 * (Equivalente a tu `patientScheduleMock` pero completo)
 */
export const patientScheduleMock = [
    {
        shiftId: 5,
        startTime: "2025-10-30T17:30:00",
        endTime: "2025-10-30T18:00:00",
        reason: "Consulta por lesión de rodilla.",
        status: mockShiftStatus.cancelled,
        doctor: mockDoctor_Sanchez,
        patient: mockPatient_Messi
    },
    {
        shiftId: 6,
        startTime: "2025-11-03T10:15:00",
        endTime: "2025-11-03T10:45:00",
        reason: "Control anual, apto físico.",
        status: mockShiftStatus.pending,
        doctor: mockDoctor_Torres, // Diferente doctor
        patient: mockPatient_Messi
    },
    {
        shiftId: 7,
        startTime: "2025-11-04T11:00:00",
        endTime: "2025-11-04T11:30:00",
        reason: "Control de lunares.",
        status: mockShiftStatus.pending,
        doctor: mockDoctor_Ruiz, // Diferente doctor
        patient: mockPatient_Messi
    },
    {
        shiftId: 8,
        startTime: "2025-10-29T15:00:00",
        endTime: "2025-10-29T15:30:00",
        reason: "Certificado de buena salud.",
        status: mockShiftStatus.attended,
        doctor: mockDoctor_Fernandez, // Diferente doctor
        patient: mockPatient_Messi
    }
];


/**
 * CONSULTAS COMPLETADAS: Lista de consultas pasadas
 * (Equivalente a tu `completedConsultationMock` pero como un array)
 */
export const completedConsultationsMock = [
    {
        consultationId: 101,
        consultationDate: "2025-10-29T15:20:00", // Fecha en que se guardó
        diagnosis: "Dolor lumbar agudo por pinzamiento",
        treatment: "Reposo relativo, 3 sesiones de kinesiología.",
        personalNotes: "Paciente refiere dolor al sentarse. Se recomienda silla ergonómica.",
        medications: [], // Caso: Consulta sin medicamentos
        shift: doctorScheduleMock[3] // Turno ID 4 (Valentina Gomez)
    },
    {
        consultationId: 102,
        consultationDate: "2025-10-29T15:20:00",
        diagnosis: "Faringoamigdalitis aguda (anginas)",
        treatment: "Reposo por 48 horas. Beber abundante líquido.",
        personalNotes: "Paciente refiere no ser alérgica a penicilina. Recetar antibiótico en caso de no mejorar en 48hs.",
        medications: [
            {
                prescriptionId: 201,
                name: "Paracetamol 1g",
                dosage: "1 comprimido cada 8 horas",
                instructions: "Tomar solo si la fiebre supera los 38°C.",
                issueDate: "2025-10-29T15:22:00"
            },
            {
                prescriptionId: 202,
                name: "Amoxicilina 875mg",
                dosage: "1 comprimido cada 12 horas por 7 días",
                instructions: "Comenzar a tomar si la fiebre persiste después de 48 horas.",
                issueDate: "2025-10-29T15:22:00"
            }
        ],
        shift: patientScheduleMock[3] // Turno ID 8 (Lionel Messi)
    }
];