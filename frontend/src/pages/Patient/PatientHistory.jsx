import React from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';

import { completedConsultationsMock } from '../../utils/mockData';

import SectionCard from '../../components/ui/SectionCard';
import ConsultationCard from '../../components/features/medicalHistory/ConsultationCard';

const PatientHistory = () => (
  <AnimatedPage>
    <div className="px-8">
      <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
        Mi Historial Clínico
      </h1>
      <SectionCard tittle={"Filtra entre tus consultas"} content={
        <div>
        
        </div>
      } />

      <div className='flex flex-row items-center justify-between mt-5 text-custom-dark-blue'>
        <h1 className="text-2xl font-bold mb-6">
          Listado de Consultas
        </h1>
        <p>(haz click en una consulta para ver en detalle)</p>
      </div>
      <SectionCard content={
        <div className="mx-2 my-1">
          {completedConsultationsMock.map(consultation => (
            <ConsultationCard
              key={consultation.consultationId}
              consultation={consultation}
              type="Patient"
            />
          ))}
        </div>
      } />
    </div>
  </AnimatedPage>
);

export default PatientHistory;
