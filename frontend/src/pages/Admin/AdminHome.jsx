import React, { useState, useEffect } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import SectionCard from '../../components/ui/SectionCard';
import Button from '../../components/ui/Button';
import AdminPatientFilterPanel from '../../components/features/filterPanel/admin/AdminPatientFilterPanel';
import AdminDoctorFilterPanel from '../../components/features/filterPanel/admin/AdminDoctorFilterPanel';
import AdminNewShift from '../../components/features/adminDataManagement/create/AdminNewShift'

import { IoMdClose } from "react-icons/io";
import StatisticsList from '../../components/features/reports/StatisticsList';

const AdminHome = () => {
  const [showNewShift, setNewShift] = useState(false);
  const [showSearchDoctor, setShowSearchDoctor] = useState(false);
  const [showSearchPatient, setShowSearchPatient] = useState(false);

  const handleNewShift = () => setNewShift(prev => !prev);
  const handleSearchDoctor = () => setShowSearchDoctor(prev => !prev);
  const handleSearchPatient = () => setShowSearchPatient(prev => !prev);

  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Estadisticas de Hoy
        </h1>

        <StatisticsList />

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
              <AdminDoctorFilterPanel viewMode="detail" />
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
