import React, { useState, useEffect, useCallback } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import { useNavigate, useParams } from 'react-router-dom';

import { completedConsultationsMock } from '../../utils/mockData';
import { calculateAge } from '../../utils/dateUtils';

import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

import SectionCard from '../../components/ui/SectionCard';
import ConsultationCard from '../../components/features/medicalHistory/ConsultationCard';
import PatientFilterPanel from '../../components/features/filterPanel/PatientFilterPanel';
import IconButton from '../../components/ui/IconButton';
import Spinner from '../../components/ui/Spinner';

import { IoMdArrowBack } from "react-icons/io";

const DoctorPatients = () => {
  const { profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { patientId } = useParams();

  const CURRENT_DOCTOR_ID = profile.doctorId;

  const [myPatients, setMyPatients] = useState([]);
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);

  const [searchResults, setSearchResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState("Cargando lista de pacientes...");
  const [currentOrder, setCurrentOrder] = useState('date_desc');

  const [isLoadingSearch, setIsLoadingSearch] = useState(true);
  const [isLoadingConsultations, setIsLoadingConsultations] = useState(false);


  // 1. ENDPOINT: GET TODOS LOS PACIENTES (o Búsqueda con Filtros)
  const searchPatients = useCallback(async (filters = {}) => {
    setIsLoadingSearch(true);
    setPatient(null);
    setSearchMessage("");

    try {
      // AQUI VA LA LLAMADA AL BACKEND (Endpoint 1)
      // const params = { doctorId: CURRENT_DOCTOR_ID, ...filters };
      // const response = await axios.get('/api/patients/search', { params });

      await new Promise(resolve => setTimeout(resolve, 500));

      // --- LOGICA MOCK ---
      // Primero obtenemos la "Base de datos" de pacientes de este doctor
      const allMyPatients = [...new Map(
        completedConsultationsMock
          .filter(c => c.shift?.doctor?.doctorId === CURRENT_DOCTOR_ID)
          .map(c => [c.shift.patient.patientId, c.shift.patient])
      ).values()];

      let results = allMyPatients;

      // Aplicamos filtros
      if (filters.dni) {
        results = results.filter(p => p.dni === filters.dni);
      } else if (filters.name) {
        results = results.filter(p =>
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(filters.name.toLowerCase())
        );
      } else if (filters.attentionDate) {
        results = results.filter(p => {
          return completedConsultationsMock.some(c => {
            const isPatient = c.shift?.patient?.patientId === p.patientId;
            const isDoctor = c.shift?.doctor?.doctorId === CURRENT_DOCTOR_ID;
            const consultDate = c.consultationDate?.split('T')[0];
            return isPatient && isDoctor && consultDate === filters.attentionDate;
          });
        });
      }
      // --- FIN MOCK ---

      // Actualizamos estado principal y resultados
      setMyPatients(allMyPatients); // Guardamos la base por si acaso
      setSearchResults(results);

      if (results.length > 0) {
        setSearchMessage(`${results.length} paciente(s) encontrado(s).`);
      } else {
        setSearchMessage("No se encontró ningún paciente con esos criterios.");
        if (Object.keys(filters).length > 0) toast.warning("Búsqueda sin resultados.");
      }

    } catch (error) {
      console.error(error);
      toast.error("Error al buscar pacientes.");
    } finally {
      setIsLoadingSearch(false);
    }
  }, [CURRENT_DOCTOR_ID, toast]);


  useEffect(() => {
    if (!patientId) {
      searchPatients();
    }
  }, [searchPatients, patientId]);



  // 2. ENDPOINT: GET PACIENTE POR ID
  useEffect(() => {
    const loadPatientById = async () => {
      if (!patientId) {
        setPatient(null);
        return;
      }

      const existing = searchResults.find(p => p.patientId === Number(patientId));
      if (existing) {
        setPatient(existing);
        return;
      }

      try {
        // AQUI VA LA LLAMADA AL BACKEND (Endpoint 2)
        // const response = await axios.get(`/api/patients/${patientId}`);
        // setPatient(response.data);

        // MOCK: Buscamos en el mock global
        await new Promise(resolve => setTimeout(resolve, 500));
        const foundInMock = completedConsultationsMock
          .find(c => c.shift.patient.patientId === Number(patientId))?.shift.patient;

        if (foundInMock) {
          setPatient(foundInMock);
        } else {
          toast.error("Paciente no encontrado.");
          navigate("/doctor/patients");
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadPatientById();
  }, [patientId, searchResults, navigate, toast]);



  // 3. ENDPOINT: GET CONSULTAS (HISTORIAL)
  const fetchConsultations = useCallback(async (selectedPatient, order) => {
    if (!selectedPatient) {
      setConsultations([]);
      return;
    }

    setIsLoadingConsultations(true);

    try {
      // AQUI VA LA LLAMADA AL BACKEND (Endpoint 3)
      // const response = await axios.get('/api/consultations', { params: ... });

      await new Promise(resolve => setTimeout(resolve, 500));

      let results = completedConsultationsMock.filter(c =>
        c.shift.patient.patientId === selectedPatient.patientId &&
        c.shift.doctor.doctorId === CURRENT_DOCTOR_ID
      );

      results.sort((a, b) => {
        const dateA = new Date(a.consultationDate);
        const dateB = new Date(b.consultationDate);
        const nameA = `${a.lastName}, ${a.firstName}`;
        const nameB = `${b.lastName}, ${b.firstName}`;

        switch (order) {
          case 'date_asc': return dateA - dateB;
          case 'date_desc': return dateB - dateA;
          case 'alpha_asc': return nameA.localeCompare(nameB);
          case 'alpha_desc': return nameB.localeCompare(nameA);
          default: return 0;
        }
      });

      setConsultations(results);

    } catch (error) {
      console.error("Error al cargar historial:", error);
      toast.error("Error al cargar el historial del paciente.");
      setConsultations([]);
    } finally {
      setIsLoadingConsultations(false);
    }
  }, [CURRENT_DOCTOR_ID, toast]);

  useEffect(() => {
    if (patient) {
      fetchConsultations(patient, currentOrder);
    }
  }, [patient, currentOrder, fetchConsultations]);


  const handleSelectPatient = (selected) => {
    setPatient(selected);
    setSearchMessage("");
  };

  const handleGoBackToSearch = () => {
    navigate("/doctor/patients");
    setPatient(null);
  };

  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Historial Clínico de Pacientes
        </h1>

        <SectionCard tittle={"Filtra entre tus Pacientes"} content={
          <PatientFilterPanel
            onSearch={searchPatients}
          />
        } />

        {patient ? (
          <>
            <div className='flex flex-row items-center justify-between mt-5 text-custom-dark-blue'>
              <h1 className="text-2xl font-bold mb-6">Listado de Consultas</h1>
              <p>(haz click en una consulta para ver en detalle)</p>
            </div>
            <SectionCard complexHeader={
              <div className="relative flex flex-row items-center justify-center">
                <div className="absolute left-0">
                  <IconButton icon={<IoMdArrowBack size={30} onClick={handleGoBackToSearch} type="button" />} />
                </div>
                <p className='text-custom-dark-blue text-center font-bold text-2xl'>Historial Clínico del Paciente</p>
              </div>
            }
              content={
                <div className="mx-2 my-1">
                  {/* Datos del Paciente */}
                  <div className="w-full px-5 py-2">
                    <div className="flex flex-row items-center justify-between">
                      <p className="font-bold text-xl">{patient.lastName}, {patient.firstName}</p>
                    </div>
                    <div className="mx-2 my-1">
                      <div className="flex flex-row items-center justify-between">
                        <p className="font-semibold">Edad: <span className="font-normal">{calculateAge(patient.birthDate)} años</span></p>
                        <p className="font-semibold">DNI: <span className="font-normal">{patient.dni}</span></p>
                        <p className="font-semibold">Teléfono: <span className="font-normal">{patient.telephone}</span></p>
                        <p className="font-semibold">Obra Social: <span className="font-normal">{patient.socialWork?.name || "No Aplica"}</span></p>
                        <p className="font-semibold">Número de Afiliado: <span className="font-normal">{patient.membershipNumber || "No Aplica"}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Consultas (Con Spinner) */}
                  <div className="w-full px-5 py-2">
                    <p className="font-bold text-xl text-start">Ultimas Consultas</p>
                    <div className="mx-2 my-1">
                      {isLoadingConsultations ? (
                        <div className="flex justify-center py-10 min-h-[100px] items-center text-custom-blue">
                          <Spinner />
                        </div>
                      ) : consultations.length > 0 ? (
                        consultations.map(consultation => (
                          <ConsultationCard
                            key={consultation.consultationId}
                            consultation={consultation}
                            type="Doctor"
                          />
                        ))
                      ) : (
                        <p className="text-center text-gray-500 p-4">
                          Este paciente no tiene consultas en su historial.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              } />
          </>
        ) : (
          // --- VISTA LISTA DE RESULTADOS ---
          isLoadingSearch ? (
            <SectionCard content={
              <div className="flex justify-center py-10 min-h-[150px] items-center text-custom-blue animate-pulse">
                <Spinner />
              </div>
            } />
          ) : searchResults.length > 0 ? (
            <SectionCard tittle={"Resultados de la Búsqueda"} content={
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
            } />
          ) : (
            <SectionCard content={
              <p className="text-center text-custom-gray p-4">
                {searchMessage}
              </p>
            } />
          )
        )}
      </div>
    </AnimatedPage>
  );
};

export default DoctorPatients;