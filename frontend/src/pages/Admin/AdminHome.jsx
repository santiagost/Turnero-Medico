import React, { useState } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import SectionCard from '../../components/ui/SectionCard';
import Button from '../../components/ui/Button';
import AdminPatientFilterPanel from '../../components/features/filterPanel/admin/AdminPatientFilterPanel';
import AdminDoctorFilterPanel from '../../components/features/filterPanel/admin/AdminDoctorFilterPanel';
import AdminNewShift from '../../components/features/adminDataManagement/create/AdminNewShift';
import StatisticsList from '../../components/features/reports/StatisticsList';

import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion';

const AdminHome = () => {
  const [showNewShift, setNewShift] = useState(false);
  const [showSearchDoctor, setShowSearchDoctor] = useState(false);
  const [showSearchPatient, setShowSearchPatient] = useState(false);

  const handleNewShift = () => setNewShift(prev => !prev);
  const handleSearchDoctor = () => setShowSearchDoctor(prev => !prev);
  const handleSearchPatient = () => setShowSearchPatient(prev => !prev);

  const sectionVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      y: -20,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    visible: {
      opacity: 1,
      height: "auto",
      y: 0,
      transition: { duration: 0.2, ease: "easeInOut", delay: 0.1 }
    }
  };

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
          <Button 
            icon={showNewShift ? <IoMdClose size={25} /> : ""} 
            text={"Asignar Nuevo Turno"} 
            variant={!showNewShift ? "primary" : "secondary"} 
            onClick={handleNewShift} 
            type={"button"} 
            size={"big"} 
          />
          <Button 
            icon={showSearchDoctor ? <IoMdClose size={25} /> : ""} 
            text={"Buscar Médico"} 
            variant={!showSearchDoctor ? "primary" : "secondary"} 
            onClick={handleSearchDoctor} 
            type={"button"} 
            size={"big"} 
          />
          <Button 
            icon={showSearchPatient ? <IoMdClose size={25} /> : ""} 
            text={"Buscar Paciente"} 
            variant={!showSearchPatient ? "primary" : "secondary"} 
            onClick={handleSearchPatient} 
            type={"button"} 
            size={"big"} 
          />
        </div>

        <div className='flex flex-col gap-6 mt-5'>
          <AnimatePresence>
            {showNewShift && (
              <motion.div
                key="new-shift-panel"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{ overflow: 'hidden' }}
              >
                <SectionCard tittle={"Asignar Turno"} content={
                  <AdminNewShift />
                } />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showSearchDoctor && (
              <motion.div
                key="doctor-search-panel"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{ overflow: 'hidden' }}
              >
                <SectionCard tittle={"Buscar Médico"} content={
                  <AdminDoctorFilterPanel viewMode="detail" />
                } />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showSearchPatient && (
              <motion.div
                key="patient-search-panel"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{ overflow: 'hidden' }}
              >
                <SectionCard tittle={"Buscar Paciente"} content={
                  <AdminPatientFilterPanel viewMode="detail" />
                } />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </AnimatedPage>
  );
};

export default AdminHome;