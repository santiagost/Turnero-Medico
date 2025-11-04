import React, { useState } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import { useAuth } from '../../hooks/useAuth';

import SectionCard from '../../components/ui/SectionCard'
import ShiftList from '../../components/features/medicalShift/ShiftList';
import ShiftAttention from '../../components/features/medicalShift/ShiftAttention';

const drSanchez = {
  name: "Martin",
  lastname: "Sanchez",
  specialty: "Traumatología y Ortopedia",
};

const initialDoctorScheduleMock = [
  {
    id: 1,
    doctor: drSanchez,
    patient: {
      name: "Emiliano",
      lastname: 'García',
      dni: '11222333',
      telephone: '3884665015',
      birthDate: '1987-06-24',
      email: 'emi.garcia@gmail.com',
      membershipNumber: '',
      socialWork: '',
    },
    reason: "Dolor en el hombro derecho por mal movimiento.",
    date: "2025-11-03",
    time: "9:30 hs",
    status: "Pendiente"
  },
  {
    id: 2,
    doctor: drSanchez,
    patient: {
      name: "Sofía",
      lastname: "Martinez",
      dni: '22333444',
      telephone: '3511234567',
      birthDate: '1995-08-15',
      email: 'sofia.martinez@gmail.com',
      membershipNumber: '9876 5432 1001',
      socialWork: 'Swiss Medical',
    },
    reason: "Control post-cirugía de rodilla.",
    date: "2025-11-03",
    time: "10:15 hs",
    status: "Pendiente"
  },
  {
    id: 3,
    doctor: drSanchez,
    patient: {
      name: "Agustín",
      lastname: "Diaz",
      dni: '33444555',
      telephone: '3517654321',
      birthDate: '2000-02-10',
      email: 'agus.diaz@hotmail.com',
      membershipNumber: 'A-123456-B',
      socialWork: 'PAMI',
    },
    reason: "Revisión de yeso en muñeca.",
    date: "2025-11-04",
    time: "11:00 hs",
    status: "Pendiente"
  },
  {
    id: 4,
    doctor: drSanchez,
    patient: {
      name: "Valentina",
      lastname: "Gomez",
      dni: '44555666',
      telephone: '3512223333',
      birthDate: '2003-11-20',
      email: 'vale.gomez@yahoo.com',
      membershipNumber: '777888999',
      socialWork: 'OSDE',
    },
    reason: "Dolor lumbar agudo, posible pinzamiento.",
    date: "2025-10-29",
    time: "15:00 hs",
    status: "Pendiente"
  },
  {
    id: 5,
    doctor: drSanchez,
    patient: {
      name: "Lionel",
      lastname: "Messi",
      dni: '30123456',
      telephone: '3411010101',
      birthDate: '1987-06-24',
      email: 'lio.messi@gmail.com',
      membershipNumber: '1010101010',
      socialWork: 'AFA',
    },
    reason: "Consulta por lesión de rodilla.",
    date: "2025-10-30",
    time: "17:30 hs",
    status: "Cancelado"
  }
];

const DoctorHome = () => {
  const { user } = useAuth();
  const [attendingShift, setAttendingShift] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

  const [doctorSchedule, setDoctorSchedule] = useState(initialDoctorScheduleMock);

  const handleCancelShift = (id) => {
    if (selectedShift && selectedShift.id === id) {
      alert("No puedes cancelar un turno que estás atendiendo. \nPor favor, guarda o descarta los cambios primero.");
      return;
    }

    alert(`Cancelar turno ID: ${id}`);
    setDoctorSchedule(prevSchedule =>
      prevSchedule.map(turno =>
        turno.id === id ? { ...turno, status: "Cancelado" } : turno
      )
    );
  };

  const handleAttendShift = (id) => {
    // Busca en el 'estado' (doctorSchedule), no en el 'mock'
    const shiftToAttend = doctorSchedule.find(turno => turno.id === id);

    if (shiftToAttend) {
      setAttendingShift(true);
      setSelectedShift(shiftToAttend);
    } else {
      console.error("Error: No se encontró el turno con el ID:", id);
    }
  };

  const handleSaveAttention = (attentionData) => {
    console.log("Datos de la consulta recibidos en DoctorHome:", attentionData);

    // --- AQUÍ VA TU LÓGICA DE BACKEND ---
    // (Ej: axios.post(`/api/consultations`, { shiftId: selectedShift.id, ...attentionData }))

    // Simulamos la actualización del estado en el 'frontend'
    setDoctorSchedule(prevSchedule =>
      prevSchedule.map(turno =>
        // Busca el turno que acabamos de atender
        turno.id === selectedShift.id
          // Y actualiza su estado
          ? { ...turno, status: "Atendido" }
          : turno
      )
    );

    // --- 3. CIERRA EL COMPONENTE (como pediste) ---
    setAttendingShift(false);
    setSelectedShift(null);

    alert("Consulta registrada con éxito.");
  };

  const handleDiscardAttention = () => {
    setAttendingShift(false);
    setSelectedShift(null);
  };

  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Próximos Turnos
        </h1>

        <SectionCard content={
          <ShiftList
            shifts={doctorSchedule}
            type={user.role}
            onAttend={handleAttendShift}
            onCancel={handleCancelShift}
          />
        } />
        {attendingShift && selectedShift && (
          <SectionCard tittle={"Atendiendo Turno"}
            content={
              <ShiftAttention
                shift={selectedShift}
                onSave={handleSaveAttention}
                onDiscard={handleDiscardAttention}
              />
            }
          />
        )}
      </div>
    </AnimatedPage>
  );
}

export default DoctorHome;
