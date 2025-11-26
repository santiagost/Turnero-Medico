import React, { useState, useEffect, useCallback } from "react";
import AnimatedPage from "../../components/layout/AnimatedPage";
import { useAuth } from "../../hooks/useAuth";

import { getConsultationsByPatient } from "../../../services/consultation.service";
import { getConsultationsIdsByDate } from "../../../services/consultation.service";

import { useToast } from "../../hooks/useToast";
import SectionCard from "../../components/ui/SectionCard";
import ConsultationCard from "../../components/features/medicalHistory/ConsultationCard";
import ConsultationFilterPanel, {
  initialFiltersState,
} from "../../components/features/filterPanel/ConsultationFilterPanel";
import { useParams } from "react-router-dom";
import Spinner from "../../components/ui/Spinner";

const PatientHistory = () => {
  const { profile } = useAuth();
  const { consultationId } = useParams();
  const toast = useToast();

  const [allPatientConsultations, setAllPatientConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);

  const [activeFilters, setActiveFilters] = useState({
    ...initialFiltersState,
    order: "date_desc" // Forzamos que la UI sepa que está ordenado por fecha
  });

  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchMasterData = async () => {
      if (!profile?.patientId) {
        setIsLoadingHistory(false);
        return;
      }

      setIsLoadingHistory(true);
      try {
        const data = await getConsultationsByPatient(profile.patientId);

        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.consultationDate || a.shift?.startTime);
          const dateB = new Date(b.consultationDate || b.shift?.startTime);
          return dateB - dateA;
        });

        setAllPatientConsultations(sortedData);
        setFilteredConsultations(sortedData);
      } catch (error) {
        console.error("Error al cargar historial:", error);
        toast.error("Error al cargar tu historial. Intenta nuevamente.");
        setAllPatientConsultations([]);
        setFilteredConsultations([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchMasterData();
  }, [profile, toast]);

  const handleFilteredSearch = async (filtersFromPanel) => {
    let results = [...allPatientConsultations];

    if (filtersFromPanel.attentionDate) {
      try {
        const idsFromBackend = await getConsultationsIdsByDate(
          filtersFromPanel.attentionDate
        );

        results = results.filter((consultation) =>
          idsFromBackend.includes(Number(consultation.consultationId))
        );
      } catch (error) {
        console.error("Error filtrando por fecha:", error);
        toast.error("Error al buscar por fecha.");
        results = [];
      }
    }

    if (filtersFromPanel.specialty) {
      const filterId = Number(filtersFromPanel.specialty);

      results = results.filter(
        (c) => c.shift?.doctor?.specialty?.specialtyId === filterId
      );
    }

    if (filtersFromPanel.doctor) {
      const filterId = Number(filtersFromPanel.doctor);
      results = results.filter((c) => c.shift?.doctorId === filterId);
    }

    if (filtersFromPanel.order) {
      const orderType = filtersFromPanel.order;

      results.sort((a, b) => {
        const dateA = new Date(a.consultationDate || a.shift?.startTime);
        const dateB = new Date(b.consultationDate || b.shift?.startTime);
        const nameA = `${a.shift?.doctor?.lastName || ""} ${a.shift?.doctor?.firstName || ""}`.trim();
        const nameB = `${b.shift?.doctor?.lastName || ""} ${b.shift?.doctor?.firstName || ""}`.trim();

        switch (orderType) {
          case "date_desc":
            return dateB - dateA;

          case "date_asc":
            return dateA - dateB;

          case "alpha_asc":
            return nameB.localeCompare(nameA);

          case "alpha_desc":
            return nameA.localeCompare(nameB);

          default:
            return 0;
        }
      });
    }

    setFilteredConsultations(results);

    if (results.length === 0) {
      toast.warning("Búsqueda sin resultados.");
    }
  };

  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Mi Historial Clínico
        </h1>

        <SectionCard
          tittle={"Filtra entre tus consultas"}
          content={<ConsultationFilterPanel onSearch={handleFilteredSearch} />}
        />

        <div className="flex flex-row items-center justify-between mt-5 text-custom-dark-blue">
          <h1 className="text-2xl font-bold mb-6">Listado de Consultas</h1>
          <p>(haz click en una consulta para ver en detalle)</p>
        </div>

        <SectionCard
          content={
            <div className="mx-2 my-1">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-10 min-h-[150px] text-custom-blue animate-pulse">
                  <Spinner />
                </div>
              ) : filteredConsultations.length === 0 ? (
                allPatientConsultations.length === 0 ? (
                  // Caso: El paciente es nuevo y no tiene historial absoluto
                  <p className="text-center text-custom-gray p-4">
                    Aún no tienes consultas en tu historial.
                  </p>
                ) : (
                  // Caso: Tiene consultas pero los filtros las ocultaron
                  <p className="text-center text-custom-gray p-4">
                    No se encontraron consultas que coincidan con los filtros
                    aplicados.
                  </p>
                )
              ) : (
                filteredConsultations.map((consultation) => (
                  <ConsultationCard
                    key={consultation.consultationId}
                    consultation={consultation}
                    type="Patient"
                    forceOpen={
                      consultation.consultationId.toString() === consultationId
                    }
                  />
                ))
              )}
            </div>
          }
        />
      </div>
    </AnimatedPage>
  );
};

export default PatientHistory;
