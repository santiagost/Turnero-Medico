import React, { useState, useEffect, useCallback } from "react";
import AnimatedPage from "../../components/layout/AnimatedPage";
import { useAuth } from "../../hooks/useAuth";

import { getConsultationsByPatient, getConsultationsIdsByDate, getConsultationById } from "../../../services/consultation.service";

import { useToast } from "../../hooks/useToast";
import SectionCard from "../../components/ui/SectionCard";
import ConsultationCard from "../../components/features/medicalHistory/ConsultationCard";
import ConsultationFilterPanel, {
  initialFiltersState,
} from "../../components/features/filterPanel/ConsultationFilterPanel";
import { useParams } from "react-router-dom";
import Spinner from "../../components/ui/Spinner";

import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
const ITEMS_PER_PAGE = 5;

const PatientHistory = () => {
  const { profile } = useAuth();
  const { consultationId } = useParams();
  const toast = useToast();

  const [allPatientConsultations, setAllPatientConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);

  const [detailedConsultation, setDetailedConsultation] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [forceOpenId, setForceOpenId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    const fetchDetailedConsultation = async (id) => {
      const numericId = Number(id);
      const compactConsultation = allPatientConsultations.find(
        (c) => c.consultationId === numericId
      );

      if (!compactConsultation) {
        // No se encuentra o la lista está vacía, no se puede forzar
        setForceOpenId(null);
        setDetailedConsultation(null);
        // Opcional: toast.error("La consulta solicitada no está en tu historial.");
        return;
      }
      setIsLoadingDetail(true);
      setForceOpenId(numericId); // Establecemos para forzar la apertura primero

      try {
        const detailData = await getConsultationById(numericId);
        setDetailedConsultation(detailData);
      } catch (error) {
        console.error(`Error al cargar detalles de consulta ${numericId}:`, error);
        toast.error("Error al cargar los detalles de la consulta.");
        setForceOpenId(null); // Si falla la carga detallada, deshacemos la apertura forzada
        setDetailedConsultation(null);
      } finally {
        setIsLoadingDetail(false);
      }
    };
    if (!isLoadingHistory && consultationId && !isLoadingDetail) {
      fetchDetailedConsultation(consultationId);
    }
    if (!consultationId) {
      setForceOpenId(null);
      setDetailedConsultation(null);
    }

  }, [isLoadingHistory, consultationId, allPatientConsultations, toast]);

  const handleFilteredSearch = async (filtersFromPanel) => {
    setForceOpenId(null);
    setDetailedConsultation(null);
    setCurrentPage(1);
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

  // --- LÓGICA DE PAGINACIÓN ---
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  // Ojo: Paginamos sobre 'filteredConsultations', no sobre 'all'
  const currentConsultations = filteredConsultations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredConsultations.length / ITEMS_PER_PAGE);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                <>
                  {/* Lista Paginada */}
                  {currentConsultations.map((consultation) => {
                    const isForcedOpen = consultation.consultationId === forceOpenId;
                    let consultationData = consultation;
                    if (isForcedOpen && detailedConsultation && detailedConsultation.consultationId === consultation.consultationId) {
                      consultationData = detailedConsultation;
                    }
                    return (
                      <ConsultationCard
                        key={consultation.consultationId}
                        consultation={consultationData}
                        type="Patient"
                        forceOpen={isForcedOpen}
                      />
                    );
                  })}

                  {/* Controles de Paginación */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-100">
                      <div className='flex flex-row items-center gap-x-2'>
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-full transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-custom-blue hover:bg-custom-light-blue transition-all ease-in-out duration-200'}`}
                        >
                          <MdNavigateBefore size={24} />
                        </button>

                        <span className="text-sm font-medium text-gray-600">
                          Página {currentPage} de {totalPages}
                        </span>
                      </div>

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-full transition-colors ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-custom-blue hover:bg-custom-light-blue transition-all ease-in-out duration-200'}`}
                      >
                        <MdNavigateNext size={24} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          }
        />
      </div>
    </AnimatedPage>
  );
};

export default PatientHistory;
