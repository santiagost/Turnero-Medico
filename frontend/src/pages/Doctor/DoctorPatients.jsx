import React, { useState, useEffect, useCallback, useRef } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import { useNavigate, useParams } from 'react-router-dom';

// Utils y Hooks
import { calculateAge } from '../../utils/dateUtils';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

// Components UI
import SectionCard from '../../components/ui/SectionCard';
import ConsultationCard from '../../components/features/medicalHistory/ConsultationCard';
import PatientFilterPanel from '../../components/features/filterPanel/PatientFilterPanel';
import IconButton from '../../components/ui/IconButton';
import Spinner from '../../components/ui/Spinner';
import { IoMdArrowBack } from "react-icons/io";

// Services
import { getMyPatients } from '../../../services/doctor.service';
import { getPatientById } from '../../../services/patient.service';
import { getConsultationsByPatient, getPatientIdsByDate } from '../../../services/consultation.service';

const DoctorPatients = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { patientId } = useParams();
  const toast = useToast();

  // --- ESTADOS ---
  const [myPatients, setMyPatients] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [patient, setPatient] = useState(null); 
  const [consultations, setConsultations] = useState([]);


  const [isInitializing, setIsInitializing] = useState(true); 
  const [isLoadingPatient, setIsLoadingDetail] = useState(false);

  const [searchMessage, setSearchMessage] = useState("Cargando...");
  const patientsLoadedRef = useRef(false);

  useEffect(() => {
    const initMasterList = async () => {
      if (patientsLoadedRef.current) return; // Evita recargas

      setIsInitializing(true);
      try {
        const data = await getMyPatients(profile.doctorId);
        setMyPatients(data);
        setSearchResults(data);
        patientsLoadedRef.current = true;

        if (data.length === 0) setSearchMessage("No tienes pacientes asignados.");
        else setSearchMessage(`${data.length} paciente(s) en total.`);

      } catch (error) {
        console.error(error);
        toast.error("Error al cargar la lista inicial.");
      } finally {
        setIsInitializing(false);
      }
    };

    initMasterList();
  }, [profile.doctorId, toast]);


  const handleSelectPatient = async (selectedBasicData) => {
    setPatient(selectedBasicData); 
    setIsLoadingDetail(true);
    
    try {
      const id = selectedBasicData.patientId;
      
      const [fullData, history] = await Promise.all([
        getPatientById(id),
        getConsultationsByPatient(id)
      ]);

      setPatient(fullData);
      setConsultations(history);

    } catch (error) {
      console.error("Error cargando detalle:", error);
      toast.error("No se pudo cargar el historial completo.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleGoBackToSearch = () => {
    setPatient(null);
    setConsultations([]);
  };


  const handleSearch = async (filters) => {
    let results = [...myPatients];

    if (filters.attentionDate) {
      try {
        const patientsWithConsultationsIds = await getPatientIdsByDate(filters.attentionDate);
        results = results.filter(p => 
          patientsWithConsultationsIds.includes(p.patientId)
        );

      } catch (error) {
        console.error("Error filtrando por fecha:", error);
        toast.error("Error al buscar por fecha.");
        results = []; 
      }
    }

    if (filters.dni) {
      results = results.filter(p => p.dni.toLowerCase().includes(filters.dni.toLowerCase()));
    }
    if (filters.name) {
      const term = filters.name.toLowerCase();
      results = results.filter(p => 
        p.firstName.toLowerCase().includes(term) || 
        p.lastName.toLowerCase().includes(term)
      );
    }
    
    const sortOrder = filters.order || 'alpha_asc';
    results.sort((a, b) => {
        const nameA = `${a.lastName}, ${a.firstName}`;
        const nameB = `${b.lastName}, ${b.firstName}`;
        return sortOrder === 'alpha_desc' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
    });

    setSearchResults(results);
    
    if (results.length === 0) {
      toast.warning("Búsqueda sin resultados.")
      setSearchMessage("No se encontraron resultados.");
    }
  };


  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Historial Clínico de Pacientes
        </h1>

        <SectionCard
          tittle={"Filtra entre tus Pacientes"}
          content={<PatientFilterPanel onSearch={handleSearch} />}
        />

        {/* CONTENIDO PRINCIPAL */}
        
        {isInitializing ? (
           <div className="flex justify-center py-20 text-custom-blue"><Spinner /></div>
        ) : patient ? (
          
          // CASO 2: VISTA DETALLE (Se muestra instantáneamente)
          <>
            <div className='flex flex-row items-center justify-between mt-5 text-custom-dark-blue'>
              <h1 className="text-2xl font-bold mb-6">Listado de Consultas</h1>
              <p>(haz click en una consulta para ver en detalle)</p>
            </div>

            <SectionCard
              complexHeader={
                <div className="relative flex flex-row items-center justify-center">
                  <div className="absolute left-0">
                    <IconButton icon={<IoMdArrowBack size={30} onClick={handleGoBackToSearch} type="button" />} />
                  </div>
                  <p className='text-custom-dark-blue text-center font-bold text-2xl'>
                    Historial Clínico del Paciente
                  </p>
                </div>
              }
              content={
                <div className="mx-2 my-1">
                  {/* Datos Personales (Siempre visibles porque usamos setPatient optimista) */}
                  <div className="w-full px-5 py-2">
                    <div className="flex flex-row items-center justify-between">
                      <p className="font-bold text-xl">{patient.lastName}, {patient.firstName}</p>
                    </div>
                    <div className="mx-2 my-1">
                      <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
                        <p className="font-semibold">Edad: <span className="font-normal">{calculateAge(patient.birthDate)} años</span></p>
                        <p className="font-semibold">DNI: <span className="font-normal">{patient.dni}</span></p>
                        <p className="font-semibold">Teléfono: <span className="font-normal">{patient.telephone}</span></p>
                        <p className="font-semibold">Obra Social: <span className="font-normal">{patient.socialWork?.name || "Particular"}</span></p>
                        <p className="font-semibold">Afiliado: <span className="font-normal">{patient.membershipNumber || "-"}</span></p>
                      </div>
                    </div>
                  </div>

                  <hr className="my-2 border-gray-200" />

                  {/* Historial de Consultas */}
                  <div className="w-full px-5 py-2">
                    <p className="font-bold text-xl text-start mb-4">Ultimas Consultas</p>
                    <div className="mx-2 my-1 flex flex-col gap-3">
                      
                      {/* Aquí usamos isLoadingPatient para mostrar spinner SOLO en las consultas */}
                      {isLoadingPatient ? (
                         <div className="flex justify-center text-custom-blue"><Spinner /></div>
                      ) : consultations.length > 0 ? (
                        consultations.map(consultation => (
                          <ConsultationCard
                            key={consultation.consultationId}
                            consultation={consultation}
                            type="Doctor"
                          />
                        ))
                      ) : (
                        <p className="text-center text-gray-500 p-6 bg-gray-50 rounded-lg">
                          Este paciente no tiene consultas registradas.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              }
            />
          </>

        ) : (
          // CASO 3: VISTA LISTA
          <SectionCard
            tittle={"Resultados de la Búsqueda"}
            content={
              searchResults.length > 0 ? (
                <div className="flex flex-col gap-2 p-4">
                  {searchResults.map(p => (
                    <div
                      key={p.patientId}
                      className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm hover:bg-custom-light-blue/25 cursor-pointer transition-colors"
                      onClick={() => handleSelectPatient(p)}
                    >
                      <span className="font-bold">{p.lastName}, {p.firstName}</span>
                      <span className="text-custom-gray">DNI: {p.dni}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-custom-gray p-8">{searchMessage}</p>
              )
            }
          />
        )}
      </div>
    </AnimatedPage>
  );
};

export default DoctorPatients;