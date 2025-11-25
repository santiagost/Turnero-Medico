import React, { useState, useEffect, useCallback } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import { useAuth } from '../../hooks/useAuth';

import { completedConsultationsMock, doctorOptions } from '../../utils/mockData';
import { useToast } from '../../hooks/useToast';

import SectionCard from '../../components/ui/SectionCard';
import ConsultationCard from '../../components/features/medicalHistory/ConsultationCard';
import ConsultationFilterPanel, { initialFiltersState, hasActiveFilters } from '../../components/features/filterPanel/ConsultationFilterPanel';

import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '../../components/ui/Spinner';

import { getSpecialtyOptions } from '../../../services/specialty.service';

const PatientHistory = () => {
  const { profile } = useAuth();
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [allPatientConsultations, setAllPatientConsultations] = useState([]);
  const [activeFilters, setActiveFilters] = useState(initialFiltersState);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const filtersAreActive = hasActiveFilters(activeFilters, consultationId);


  const handleFilteredSearch = (filtersFromPanel) => {
    setActiveFilters({ ...filtersFromPanel });
  }

  const fetchHistory = useCallback(async (currentFilters, currentConsultationId) => {
    if (!profile) {
      setIsLoadingHistory(false);
      return;
    }

    setIsLoadingHistory(true);

    const params = {
      patientId: profile.patientId,
      ...currentFilters,
      consultationId: currentConsultationId || currentFilters.consultationId || undefined
    };

    Object.keys(params).forEach(key => params[key] === undefined || params[key] === "" && delete params[key]);

    try {
      // AQUI VA LA LLAMADA AL BACKEND
      // const response = await axios.get(`/api/history`, { params });
      // const responseData = response.data;

      await new Promise(resolve => setTimeout(resolve, 500));

      let baseline = completedConsultationsMock.filter(c =>
        c.shift?.patient?.patientId === profile.patientId
      );

      if (params.specialty) {
        baseline = baseline.filter(c => c.shift?.doctor?.specialty.specialtyId === parseInt(params.specialty));
      }
      if (params.doctor) {
        baseline = baseline.filter(c => c.shift?.doctor?.doctorId === parseInt(params.doctor));
      }
      if (params.date) {
        baseline = baseline.filter(c => c.shift?.startTime?.startsWith(params.date));
      }
      if (params.consultationId) {
        baseline = baseline.filter(c => c.consultationId.toString() === params.consultationId);
      }

      const order = params.order || 'date_desc';
      baseline.sort((a, b) => {
        switch (order) {
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

      setAllPatientConsultations(baseline);
      setFilteredConsultations(baseline);

    } catch (error) {
      console.error("Error al cargar historial:", error);
      toast.error("Error al cargar tu historial. Intenta nuevamente.");
      setAllPatientConsultations([]);
      setFilteredConsultations([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [profile, toast]);


  useEffect(() => {
    const filtersToApply = { ...activeFilters, order: activeFilters.order };
    fetchHistory(filtersToApply, consultationId);

    // Este useEffect se dispara cuando:
    // 1. Se monta el componente (activeFilters es initialFiltersState).
    // 2. Cambia un filtro en el panel (activeFilters cambia).
    // 3. Cambia el ID de la URL (consultationId cambia).

  }, [activeFilters, fetchHistory, consultationId]);

  const [specialtyOptionsWithAll, setSpecialtyOptions] = useState([
    { value: "", label: "Todas" }
  ]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const dataFromBackend = await getSpecialtyOptions();

        setSpecialtyOptions([
          { value: "", label: "Todas" },
          ...dataFromBackend
        ]);
      } catch (error) {
        console.error("No se pudieron cargar las opciones", error);
      }
    };

    fetchOptions();
  }, []);

  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Mi Historial Clínico
        </h1>

        <SectionCard tittle={"Filtra entre tus consultas"} content={
          <ConsultationFilterPanel
            onSearch={handleFilteredSearch}
            specialties={specialtyOptionsWithAll}
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
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-10 min-h-[150px] text-custom-blue animate-pulse">
                <Spinner />
              </div>
            ) : filteredConsultations.length === 0 ? (
              allPatientConsultations.length === 0 && !filtersAreActive ? (
                <p className="text-center text-custom-gray p-4">
                  Aún no tienes consultas en tu historial.
                </p>
              ) : (
                <p className="text-center text-custom-gray p-4">
                  No se encontraron consultas que coincidan con los filtros aplicados.
                </p>
              )
            ) : (
              filteredConsultations.map(consultation => (
                <ConsultationCard
                  key={consultation.consultationId}
                  consultation={consultation}
                  type="Patient"
                  forceOpen={consultation.consultationId.toString() === consultationId}
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
