import React, { useState, useEffect } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';

import { completedConsultationsMock, doctorOptions, specialtyOptions } from '../../utils/mockData';

import SectionCard from '../../components/ui/SectionCard';
import ConsultationCard from '../../components/features/medicalHistory/ConsultationCard';
import ConsultationFilterPanel, { initialFiltersState } from '../../components/features/filterPanel/ConsultationFilterPanel';


const PatientHistory = () => {
  // const [allConsultations, setAllConsultations] = useState([]); // Debe empezar vacio cuando este con una api
  const [allConsultations, setAllConsultations] = useState(completedConsultationsMock);
  const [activeFilters, setActiveFilters] = useState(initialFiltersState);
  const [filteredConsultations, setFilteredConsultations] = useState([]); // Empieza vacío


  const handleFilteredSearch = (filtersFromPanel) => {
    console.log("Nuevos filtros aplicados:", filtersFromPanel);
    setActiveFilters(filtersFromPanel);
  }

  useEffect(() => {
    let results = [...allConsultations];
    let filtersApplied = false;

    // Lógica de Filtrado
    if (activeFilters.specialty) {
      results = results.filter(c => c.shift.doctor.specialty.specialtyId === parseInt(activeFilters.specialty));
      filtersApplied = true;
    }
    if (activeFilters.doctor) {
      results = results.filter(c => c.shift.doctor.doctorId === parseInt(activeFilters.doctor));
      filtersApplied = true;
    }
    if (activeFilters.date) {
      results = results.filter(c => c.shift.startTime.startsWith(activeFilters.date));
      filtersApplied = true;
    }

    // Lógica de Orden (El orden no cuenta como "filtro" para el mensaje)
    results.sort((a, b) => {
      // ... (tu lógica de sort)
    });

    setFilteredConsultations(results);

    // Si no se aplicó ningún filtro, mostramos todos los resultados
    // (Esto evita que la lista aparezca vacía al cargar)
    if (!filtersApplied && activeFilters.date === "") {
      setFilteredConsultations(allConsultations);
    }

  }, [activeFilters, allConsultations]);

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
            {allConsultations.length === 0 ? (
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
