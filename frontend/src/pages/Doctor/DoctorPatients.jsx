import React, { useState, useEffect } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import { useParams } from 'react-router-dom';


import {
  completedConsultationsMock,
  doctorScheduleMock
} from '../../utils/mockData';

import { calculateAge } from '../../utils/dateUtils';

import SectionCard from '../../components/ui/SectionCard';
import ConsultationCard from '../../components/features/medicalHistory/ConsultationCard';
import PatientFilterPanel from '../../components/features/filterPanel/PatientFilterPanel';
import IconButton from '../../components/ui/IconButton';

import { IoMdArrowBack } from "react-icons/io";

// Simulamos la lista de pacientes únicos que este doctor atiende
// (En una app real, la API te daría esto)
const uniquePatients = [...new Map(doctorScheduleMock.map(shift => [shift.patient.patientId, shift.patient])).values()];

const CURRENT_DOCTOR_ID = 1; // ID de Dr. Martin Sanchez

const DoctorPatients = () => {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [searchMessage, setSearchMessage] = useState("Busca un paciente por DNI o nombre para ver su historial.");
  const [searchResults, setSearchResults] = useState(uniquePatients);


  const handleFilteredSearch = (filters) => {
    console.log("Buscando paciente con:", filters);
    setPatient(null);


    if (!filters.dni && !filters.name && !filters.attentionDate) {
      setSearchResults(uniquePatients); // Muestra todos
      setSearchMessage(""); // Limpia cualquier mensaje de "no encontrado"
      return; // Termina la función aquí
    }


    let foundPatients = [];
    if (filters.dni) {
      foundPatients = uniquePatients.filter(p => p.dni === filters.dni);
    } else if (filters.name) {
      foundPatients = uniquePatients.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    // (Nota: Aún no has implementado el filtro por 'attentionDate', 
    // pero eso no afecta la lógica del reset)

    setSearchResults(foundPatients);

    if (foundPatients.length > 0) {
      setSearchMessage(`${foundPatients.length} paciente(s) encontrado(s).`);
    } else {
      setSearchMessage("No se encontró ningún paciente con esos datos.");
    }
  }

  const handleSelectPatient = (selected) => {
    console.log("Paciente seleccionado:", selected);
    setPatient(selected);
    setSearchMessage("");
  };

  const handleGoBackToSearch = () => {
    setPatient(null);
  };

  useEffect(() => {
    if (patient) {
      const results = completedConsultationsMock.filter(c =>
        c.shift.patient.patientId === patient.patientId &&
        c.shift.doctor.doctorId === CURRENT_DOCTOR_ID
      );
      setConsultations(results);
    } else {
      setConsultations([]);
    }
  }, [patient]);

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
                  <p>Historial Clínico del Paciente</p>
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

