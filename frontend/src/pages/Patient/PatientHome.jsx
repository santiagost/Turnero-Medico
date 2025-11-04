import React from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import { useAuth } from '../../hooks/useAuth';


import SectionCard from '../../components/ui/SectionCard'
import ShiftList from '../../components/features/medicalShift/ShiftList';

const PatientHome = () => {
  const { user } = useAuth()

  const leoMessi = {
    name: "Lionel",
    lastname: "Messi",
    dni: '30123456',
    telephone: '3411010101',
    birthDate: '1987-06-24',
    email: 'lio.messi@gmail.com',
    membershipNumber: '1010101010',
    socialWork: 'AFA',
  };

  const patientScheduleMock = [
    {
      id: 1,
      doctor: {
        name: "Martin",
        lastname: "Sanchez",
        specialty: "Traumatología y Ortopedia",
      },
      patient: leoMessi,
      reason: "Consulta por lesión de rodilla.",
      date: "2025-10-30",
      time: "17:30 hs",
      status: "Cancelado"
    },
    {
      id: 2,
      doctor: {
        name: "Ana",
        lastname: "Torres",
        specialty: "Cardiología",
      },
      patient: leoMessi,
      reason: "Control anual, apto físico.",
      date: "2025-11-03",
      time: "10:15 hs",
      status: "Pendiente"
    },
    {
      id: 3,
      doctor: {
        name: "Carlos",
        lastname: "Ruiz",
        specialty: "Dermatología",
      },
      patient: leoMessi,
      reason: "Control de lunares.",
      date: "2025-11-04",
      time: "11:00 hs",
      status: "Pendiente"
    },
    {
      id: 4,
      doctor: {
        name: "Lucía",
        lastname: "Fernandez",
        specialty: "Clínica Médica",
      },
      patient: leoMessi,
      reason: "Certificado de buena salud.",
      date: "2025-10-29",
      time: "15:00 hs",
      status: "Pendiente"
    },
    {
      id: 5,
      doctor: {
        name: "Javier",
        lastname: "Mascherano",
        specialty: "Kinesiología",
      },
      patient: leoMessi,
      reason: "Rehabilitación de rodilla, sesión 1.",
      date: "2025-11-05",
      time: "16:00 hs",
      status: "Pendiente"
    }
  ];

  const handleCancelShift = (id) => {
    alert(`Cancelar turno ID: ${id}`);
  };

  const handleAttendShift = (id) => {
    alert(`Atender turno ID: ${id}`);
  };

  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Mis Próximos Turnos
        </h1>

        <SectionCard content={
          <ShiftList
            shifts={patientScheduleMock}
            type={user.role}
            onAttend={handleAttendShift}
            onCancel={handleCancelShift}
          />
        } />
        <SectionCard tittle={"Solicitar Nuevo Turno"} content={""} />
      </div>
    </AnimatedPage>
  );
}

export default PatientHome;
