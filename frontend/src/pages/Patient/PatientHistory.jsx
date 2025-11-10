import React, { useState, useEffect } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import { useAuth } from '../../hooks/useAuth';

import { completedConsultationsMock, doctorOptions, specialtyOptions } from '../../utils/mockData';

import SectionCard from '../../components/ui/SectionCard';
import ConsultationCard from '../../components/features/medicalHistory/ConsultationCard';
import ConsultationFilterPanel, { initialFiltersState } from '../../components/features/filterPanel/ConsultationFilterPanel';


const PatientHistory = () => {
  const { profile } = useAuth();

  const [allPatientConsultations, setAllPatientConsultations] = useState([]);
  const [activeFilters, setActiveFilters] = useState(initialFiltersState);
  const [filteredConsultations, setFilteredConsultations] = useState([]); // Empieza vacío


  const handleFilteredSearch = (filtersFromPanel) => {
    console.log("Nuevos filtros aplicados:", filtersFromPanel);
    setActiveFilters(filtersFromPanel);
  }

  useEffect(() => {
    if (profile) {
      const baseline = completedConsultationsMock.filter(c =>
        c.shift.patient.patientId === profile.patientId
      );
      setAllPatientConsultations(baseline);
    }
  }, [profile]);

  useEffect(() => {
    // Empieza con la lista maestra *ya filtrada por paciente*
    let results = [...allPatientConsultations];

    // Lógica de Filtrado
    if (activeFilters.specialty) {
      results = results.filter(c => c.shift.doctor.specialty.specialtyId === parseInt(activeFilters.specialty));
    }
    if (activeFilters.doctor) {
      results = results.filter(c => c.shift.doctor.doctorId === parseInt(activeFilters.doctor));
    }
    if (activeFilters.date) {
      results = results.filter(c => c.shift.startTime.startsWith(activeFilters.date));
    }

    // Lógica de Orden
    results.sort((a, b) => {
      // ... (tu lógica de sort, ej: por 'date_desc')
      switch (activeFilters.order) {
        case 'date_asc':
          return new Date(a.consultationDate) - new Date(b.consultationDate);
        case 'alpha_asc':
          return a.shift.doctor.specialty.name.localeCompare(b.shift.doctor.specialty.name);
        case 'alpha_desc':
          return b.shift.doctor.specialty.name.localeCompare(a.shift.doctor.specialty.name);
        case 'date_desc':
        default:
          return new Date(b.consultationDate) - new Date(a.consultationDate);
      }
    });

    setFilteredConsultations(results);

    
  }, [activeFilters, allPatientConsultations]);

  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Mi Historial Clínico
        </h1>
        <SectionCard tittle={"Filtra entre tus consultas"} content={
          <ConsultationFilterPanel
            onSearch={handleFilteredSearch}
            specialties={specialtyOptions}
            doctors={doctorOptions}
          />
        } />

        <div className='flex flex-row items-center justify-between mt-5 text-custom-dark-blue'>
          <h1 className="text-2xl font-bold mb-6">
            Listado de Consultas
          </h1>
          <p>(haz click en una consulta para ver en detalle)</p>
        </div>
        <SectionCard content={
          <div className="mx-2 my-1">
            {allPatientConsultations.length === 0 ? (
              // 1. No hay consultas EN TOTAL
              <p className="text-center text-custom-gray p-4">
                Aún no tienes consultas en tu historial. Cuando hayas completado tu primera consulta, los detalles aparecerán aquí.
              </p>
            ) : filteredConsultations.length === 0 ? (
              // 2. Hay consultas, pero el filtro no arrojó resultados
              <p className="text-center text-custom-gray p-4">
                No se encontraron consultas que coincidan con los filtros.
              </p>
            ) : (
              // 3. Hay resultados filtrados para mostrar
              filteredConsultations.map(consultation => (
                <ConsultationCard
                  key={consultation.consultationId}
                  consultation={consultation}
                  type="Patient"
                />
              ))
            )}
          </div>
        } />
      </div>
    </AnimatedPage>
  );
};

export default PatientHistory;
