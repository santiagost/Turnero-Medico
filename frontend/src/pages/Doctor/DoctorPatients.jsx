import React, { useState, useEffect } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import { useNavigate, useParams } from 'react-router-dom';


import {
  completedConsultationsMock,

} from '../../utils/mockData';

import { calculateAge } from '../../utils/dateUtils';

import SectionCard from '../../components/ui/SectionCard';
import ConsultationCard from '../../components/features/medicalHistory/ConsultationCard';
import PatientFilterPanel from '../../components/features/filterPanel/PatientFilterPanel';
import IconButton from '../../components/ui/IconButton';

import { IoMdArrowBack } from "react-icons/io";

import { useAuth } from '../../hooks/useAuth';

const DoctorPatients = () => {
  const { profile } = useAuth();
  const CURRENT_DOCTOR_ID = profile.doctorId;

  // Simulamos la lista de pacientes únicos que este doctor atiende
  // (En una app real, la API te daría esto)
  const uniquePatients = [...new Map(
    completedConsultationsMock
      .filter(c => c.shift?.doctor?.doctorId === CURRENT_DOCTOR_ID) // 1. Filtramos por Doctor
      .map(c => [c.shift.patient.patientId, c.shift.patient])       // 2. Extraemos Pacientes
  ).values()];


  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [searchMessage, setSearchMessage] = useState(
    uniquePatients.length > 0
      ? "Busca un paciente por DNI o nombre para ver su historial."
      : "No tienes pacientes con historial clínico aún."
  );
  const [searchResults, setSearchResults] = useState(uniquePatients);
  const [currentOrder, setCurrentOrder] = useState('date_desc');


  const handleFilteredSearch = (filters) => {
    console.log("Buscando paciente con:", filters);
    setPatient(null);

    // 1. ACTUALIZAMOS EL ORDEN SIEMPRE QUE SE BUSCA
    // Esto asegura que el useEffect tenga el valor correcto
    if (filters.order) {
      setCurrentOrder(filters.order);
    }

    // Si no hay filtros de búsqueda de paciente (solo orden), reseteamos la lista de pacientes
    // pero mantenemos el orden guardado para cuando seleccionen uno.
    if (!filters.dni && !filters.name && !filters.attentionDate) {
      setSearchResults(uniquePatients);
      setSearchMessage("");
      return;
    }

    let foundPatients = [];

    if (filters.dni) {
      foundPatients = uniquePatients.filter(p => p.dni === filters.dni);
    } else if (filters.name) {
      foundPatients = uniquePatients.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(filters.name.toLowerCase())
      );
    } else if (filters.attentionDate) {
      foundPatients = uniquePatients.filter(p => {
        return completedConsultationsMock.some(c => {
          const isPatient = c.shift?.patient?.patientId === p.patientId;
          const isDoctor = c.shift?.doctor?.doctorId === CURRENT_DOCTOR_ID;
          const consultDate = c.consultationDate?.split('T')[0];
          const isDateMatch = consultDate === filters.attentionDate;
          return isPatient && isDoctor && isDateMatch;
        });
      });
    }

    setSearchResults(foundPatients);

    if (foundPatients.length > 0) {
      setSearchMessage(`${foundPatients.length} paciente(s) encontrado(s).`);
    } else {
      setSearchMessage("No se encontró ningún paciente con esos criterios en tu historial.");
    }
  }

  const handleSelectPatient = (selected) => {
    console.log("Paciente seleccionado:", selected);
    setPatient(selected);
    setSearchMessage("");
  };

  const handleGoBackToSearch = () => {
    navigate("/doctor/patients")
    setPatient(null);
  };

  useEffect(() => {
    if (patient) {
      // A) Obtener consultas sin ordenar
      let results = completedConsultationsMock.filter(c =>
        c.shift.patient.patientId === patient.patientId &&
        c.shift.doctor.doctorId === CURRENT_DOCTOR_ID
      );

      // B) Aplicar el ordenamiento
      // Nota: .sort() muta el array, pero como 'results' es nuevo (.filter crea uno nuevo), es seguro.
      results.sort((a, b) => {
        const dateA = new Date(a.consultationDate);
        const dateB = new Date(b.consultationDate);
        const nameA = `${a.lastName}, ${a.firstName}`;
        const nameB = `${b.lastName}, ${b.firstName}`;

        switch (currentOrder) {
          case 'date_asc': // Más antiguo primero
            return dateA - dateB;

          case 'date_desc': // Más reciente primero
            return dateB - dateA;

          case 'alpha_asc': // A-Z
            return nameA.localeCompare(nameB);

          case 'alpha_desc': // Z-A
            return nameB.localeCompare(nameA);

          default:
            return 0;
        }
      });

      setConsultations(results);
    } else {
      setConsultations([]);
    }
  }, [patient, currentOrder]);

  useEffect(() => {
    if (patientId) {
      const idToFind = Number(patientId);
      const found = uniquePatients.find(p => p.patientId === idToFind);

      if (found) {
        setPatient(found);
        setSearchMessage("");
      }
    } else {
      setPatient(null);
    }
  }, [patientId]);

  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Historial Clínico de Pacientes
        </h1>
        <SectionCard tittle={"Filtra entre tus Pacientes"} content={
          <PatientFilterPanel
            onSearch={handleFilteredSearch}
          />
        } />

        {patient ? (
          <>
            <div className='flex flex-row items-center justify-between mt-5 text-custom-dark-blue'>
              <h1 className="text-2xl font-bold mb-6">
                Listado de Consultas
              </h1>
              <p>(haz click en una consulta para ver en detalle)</p>
            </div>
            <SectionCard complexHeader={
              <>
                <div className="relative flex flex-row items-center justify-center">
                  <div className="absolute left-0">
                    <IconButton icon={<IoMdArrowBack size={30} onClick={handleGoBackToSearch} type="button" />} />
                  </div>
                  <p className='text-custom-dark-blue text-center font-bold text-2xl'>Historial Clínico del Paciente</p>
                </div>
              </>
            }
              content={
                <div className="mx-2 my-1">
                  {/* Info del paciente encontrado */}
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
                  {/* Lista de sus consultas */}
                  <div className="w-full px-5 py-2">
                    <p className="font-bold text-xl text-start">Ultimas Consultas</p>
                    <div className="mx-2 my-1">
                      {consultations.length > 0 ? (
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
        ) : searchResults.length > 0 ? (
          <SectionCard tittle={"Resultados de la Búsqueda"} content={<div className="flex flex-col gap-2 p-4">
            {searchResults.map(p => (
              <div
                key={p.patientId}
                className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm hover:bg-custom-light-blue/25 cursor-pointer"
                onClick={() => handleSelectPatient(p)}
              >
                <span className="font-bold">{p.lastName}, {p.firstName}</span>
                <span className="text-custom-gray">DNI: {p.dni}</span>
              </div>
            ))}
          </div>}
          />
        ) : (
          <SectionCard content={
            <p className="text-center text-custom-gray p-4">
              {searchMessage}
            </p>
          } />
        )}
      </div>
    </AnimatedPage>
  );
};

export default DoctorPatients;

