import React, { useState, useEffect } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import SectionCard from '../../components/ui/SectionCard';
import Button from '../../components/ui/Button';
import AdminPatientFilterPanel from '../../components/features/filterPanel/admin/AdminPatientFilterPanel';
import AdminDoctorFilterPanel from '../../components/features/filterPanel/admin/AdminDoctorFilterPanel';
import AdminNewShift from '../../components/features/adminDataManagement/create/AdminNewShift'

import { IoMdClose } from "react-icons/io";

const AdminHome = () => {
  const [statistics, setStatistics] = useState({
    totalShifts: 60,
    patientsTreated: 15,
    cancelledShifts: 7,
    newPatientsRegistered: 5
  });

  const [showNewShift, setNewShift] = useState(false);
  const [showSearchDoctor, setShowSearchDoctor] = useState(false);
  const [showSearchPatient, setShowSearchPatient] = useState(false);

  const handleNewShift = () => setNewShift(prev => !prev);
  const handleSearchDoctor = () => setShowSearchDoctor(prev => !prev);
  const handleSearchPatient = () => setShowSearchPatient(prev => !prev);

  const fetchStatistics = () => {
    console.log("Buscando estadísticas actualizadas...");
    // En un futuro, aquí harías tu llamada a la API:
    // try {
    //   const response = await fetch('/api/admin/statistics');
    //   const data = await response.json();
    //   setStatistics(data);
    // } catch (error) {
    //   console.error("Error al cargar estadísticas:", error);
    // }
  };

  useEffect(() => {
    fetchStatistics();
    const intervalId = setInterval(() => {
      fetchStatistics();
    }, 60000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Estadisticas de Hoy
        </h1>

        <div className='flex flex-row gap-4 items-center justify-around w-full'>
          <SectionCard complexHeader={<p className='w-[15vw]'>Turnos Totales<br />de Hoy</p>}
            content={<p className='text-5xl text-custom-dark-blue font-bold text-center m-5'>{statistics.totalShifts}</p>} />
          <SectionCard complexHeader={<p className='w-[15vw]'>Pacientes <br />Atendidos</p>}
            content={<p className='text-5xl text-custom-dark-blue font-bold text-center m-5'>{statistics.patientsTreated}</p>} />
          <SectionCard complexHeader={<p className='w-[15vw]'>Turnos Cancelados de Hoy</p>}
            content={<p className='text-5xl text-custom-dark-blue font-bold text-center m-5'>{statistics.cancelledShifts}</p>} />
          <SectionCard complexHeader={<p className='w-[15vw]'>Nuevos Pacientes Registrados</p>}
            content={<p className='text-5xl text-custom-dark-blue font-bold text-center m-5'>{statistics.newPatientsRegistered}</p>} />
        </div>

        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6 mt-5">
          Accesos Rápidos
        </h1>

        <div className='flex flex-row gap-4 items-center justify-around w-full'>
          <Button icon={showNewShift ? <IoMdClose size={25} /> : ""} text={"Asignar Nuevo Turno"} variant={!showNewShift ? "primary" : "secondary"} onClick={handleNewShift} type={"button"} size={"big"} />
          <Button icon={showSearchDoctor ? <IoMdClose size={25} /> : ""} text={"Buscar Médico"} variant={!showSearchDoctor ? "primary" : "secondary"} onClick={handleSearchDoctor} type={"button"} size={"big"} />
          <Button icon={showSearchPatient ? <IoMdClose size={25} /> : ""} text={"Buscar Paciente"} variant={!showSearchPatient ? "primary" : "secondary"} onClick={handleSearchPatient} type={"button"} size={"big"} />
        </div>

        <div className='flex flex-col gap-6 mt-5'>
          {showNewShift &&
            <SectionCard tittle={"Asignar Turno"} content={
              <AdminNewShift />
            } />
          }

          {showSearchDoctor &&
            <SectionCard tittle={"Buscar Médico"} content={
              <AdminDoctorFilterPanel viewMode = "detail"/>
            } />
          }
          {showSearchPatient &&
            <SectionCard tittle={"Buscar Paciente"} content={
              <AdminPatientFilterPanel viewMode="detail" />
            } />
          }
        </div>
      </div>
    </AnimatedPage>
  );
};

export default AdminHome;
