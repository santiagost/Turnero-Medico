import React, { useState } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import SectionCard from '../../components/ui/SectionCard';
import AdminNewSocialWork from '../../components/features/adminDataManagement/create/AdminNewSocialWork';
import AdminNewSpecialty from '../../components/features/adminDataManagement/create/AdminNewSpeciality';
import AdminSocialWorkFilterPanel from '../../components/features/filterPanel/admin/AdminSocialWorkFilterPanel';
import AdminSpecialtyFilterPanel from '../../components/features/filterPanel/admin/AdminSpecialityFilterPanel';
import Button from '../../components/ui/Button';
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion'

const AdminOthers = () => {
  const [showNewSocialWork, setShowNewSocialWork] = useState(false);
  const [showNewSpecialty, setShowNewSpecialty] = useState(false);

  const toggleSocialWork = () => setShowNewSocialWork(prev => !prev);
  const toggleSpecialty = () => setShowNewSpecialty(prev => !prev);

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
      transition: { duration: 0.3, ease: "easeInOut", delay: 0.1 }
    }
  };

  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Creación de Registros
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex flex-row gap-4 items-center w-full mb-6'>
          <Button
            icon={showNewSocialWork ? <IoMdClose size={25} /> : ""}
            text={"Crear Obra Social"}
            variant={!showNewSocialWork ? "primary" : "secondary"}
            onClick={toggleSocialWork}
            type={"button"}
            size={"big"}
          />
          <Button
            icon={showNewSpecialty ? <IoMdClose size={25} /> : ""}
            text={"Crear Especialidad"}
            variant={!showNewSpecialty ? "primary" : "secondary"}
            onClick={toggleSpecialty}
            type={"button"}
            size={"big"}
          />
        </motion.div>

        <AnimatePresence>
          {showNewSocialWork && (
            <motion.div
              key="new-social-work"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ overflow: 'hidden' }}
            >
              <SectionCard tittle={"Nueva Obra Social"} content={
                <AdminNewSocialWork />
              } />
            </motion.div>
          )}

          {showNewSpecialty && (
            <motion.div
              key="new-specialty"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ overflow: 'hidden' }}
            >
              <SectionCard tittle={"Nueva Especialidad"} content={
                <AdminNewSpecialty />
              } />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Las secciones de búsqueda siempre están visibles */}
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6 mt-8">
          Listado de Obras Sociales
        </h1>
        <SectionCard tittle={"Buscar Obra Social"} content={
          <AdminSocialWorkFilterPanel />
        } />

        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6 mt-8">
          Listado de Especialidades
        </h1>
        <SectionCard tittle={"Buscar Especialidad"} content={
          <AdminSpecialtyFilterPanel />
        } />
      </div>
    </AnimatedPage>
  );
};
export default AdminOthers;
