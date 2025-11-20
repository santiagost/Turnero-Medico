import React from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import SectionCard from '../../components/ui/SectionCard';
import DoctorShifts from '../../components/features/schedule/DoctorShifts';

const DoctorSchedule = () => (
  <AnimatedPage>
    <div className="px-8">
      <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
        Gestión de Turnos
      </h1>
      <SectionCard tittle={"Mi Agenda"} content={<DoctorShifts />} />
    </div>
  </AnimatedPage>
);

export default DoctorSchedule;
