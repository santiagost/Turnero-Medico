import React from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import { useAuth } from '../../hooks/useAuth';

import SectionCard from '../../components/ui/SectionCard'
import ShiftList from '../../components/features/medicalShift/ShiftList';

import { patientScheduleMock } from '../../utils/mockData';

const PatientHome = () => {
  const { user } = useAuth()

  const handleCancelShift = (id) => {
    alert(`Cancelar turno ID: ${id}`);
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
            onCancel={handleCancelShift}
          />
        } />
        <SectionCard tittle={"Solicitar Nuevo Turno"} content={""} />
      </div>
    </AnimatedPage>
  );
}

export default PatientHome;
