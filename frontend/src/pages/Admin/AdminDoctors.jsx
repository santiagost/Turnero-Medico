import React, { useState } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import SectionCard from '../../components/ui/SectionCard';
import AdminNewDoctor from '../../components/features/adminDataManagement/create/AdminNewDoctor';
import AdminDoctorFilterPanel from '../../components/features/filterPanel/admin/AdminDoctorFilterPanel';
import Button from '../../components/ui/Button';
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import AdminEditDoctor from '../../components/features/adminDataManagement/edit/AdminEditDoctor';

import Modal from '../../components/ui/Modal';
import PrincipalCard from '../../components/ui/PrincipalCard';

const AdminDoctors = () => {
  const [showNewDoctor, setShowNewDoctor] = useState(false);
  const toggleNewDoctor = () => setShowNewDoctor(prev => !prev);
  const { doctorId } = useParams();
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorId ? parseInt(doctorId) : "");

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

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [doctorIdToDelete, setDoctorIdToDelete] = useState(null);
  const [dataToSave, setDataToSave] = useState(null);

  const handleDoctorToDelete = (id) => {
    setDoctorIdToDelete(id);
    setIsDeleteModalOpen(true);
  }
  const handleDoctorToEdit = (id) => {
    setSelectedDoctorId(id)
  }

  const handleSave = (doctorData) => {
    setDataToSave(doctorData);
    setIsSaveModalOpen(true);
  }

  const handleCancel = () => {
    setIsDiscardModalOpen(true);
  }

  const confirmSave = () => {
    console.log("Guardando cambios en el paciente:", dataToSave);
    // ... Aquí iría tu lógica de API para actualizar al paciente ...

    setIsSaveModalOpen(false);
    setDataToSave(null);
    setSelectedDoctorId();
  };

  const confirmDelete = () => {
    console.log("Eliminando paciente ID:", doctorIdToDelete);
    // ... Aquí iría tu lógica de API para eliminar al paciente ...

    // Simulación: Muestra alerta y cierra
    setIsDeleteModalOpen(false);
    setDoctorIdToDelete(null);
    // Aquí deberías re-ejecutar la búsqueda en AdminDoctorFilterPanel
    // para que la lista se actualice.
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDoctorIdToDelete(null);
  };

  const closeSaveModal = () => {
    setIsSaveModalOpen(false);
    setDataToSave(null);
  };

  const confirmDiscard = () => {
    setIsDiscardModalOpen(false);
    setSelectedDoctorId(null);
  };

  const closeDiscardModal = () => {
    setIsDiscardModalOpen(false);
  };

  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Gestión de Médicos
        </h1>

        <div className='flex flex-row gap-4 items-center w-full mb-6'>
          <Button
            icon={showNewDoctor ? <IoMdClose size={25} /> : ""}
            text={"Registrar Nuevo Médico"}
            variant={!showNewDoctor ? "primary" : "secondary"}
            onClick={toggleNewDoctor}
            type={"button"}
            size={"big"}
          />
        </div>

        <AnimatePresence>
          {showNewDoctor && (
            <motion.div
              key="new-doctor"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ overflow: 'hidden' }}
            >
              <SectionCard tittle={"Crear Médico"} content={
                <AdminNewDoctor />
              } />
            </motion.div>
          )}
        </AnimatePresence>

        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6 mt-8">
          Buscar Médicos
        </h1>
        <SectionCard tittle={"Buscar Médico"} content={
          <AdminDoctorFilterPanel viewMode="admin" doctorToDelete={handleDoctorToDelete} doctorToEdit={handleDoctorToEdit} />
        } />

        <AnimatePresence>
          {selectedDoctorId &&
            <motion.div
              key="edit-doctor"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ overflow: 'hidden' }}
            >
              <h1 className="text-2xl font-bold text-custom-dark-blue mb-6 mt-8">
                Detalle del Médico
              </h1>
              <SectionCard tittle={"Editar Doctor"} content={
                <AdminEditDoctor doctorId={selectedDoctorId} onSave={handleSave} onCancel={handleCancel} />
              } />

              <h1 className="text-2xl font-bold text-custom-dark-blue mb-6 mt-8">
                Horarios del Médico
              </h1>
              <SectionCard tittle={"Definir el Horario de Atención de un Médico"} content={
                // <AdminSchedulePanel /> // (Placeholder para tu futuro componente)
                <div>Contenido de Horarios...</div>
              } />
            </motion.div>
          }
        </AnimatePresence>

      </div>
      {/* Modal de Guardar Cambios */}
      <Modal isOpen={isSaveModalOpen} onClose={closeSaveModal}>
        <PrincipalCard
          title="Guardar Cambios"
          content={
            <div className="flex flex-col items-center gap-6 p-4">
              <p className="text-center text-custom-dark-blue">
                ¿Estás seguro de que deseas guardar los cambios en este médico?
              </p>
              <div className="flex flex-row gap-10">
                <Button text="Seguir Editando" variant="secondary" onClick={closeSaveModal} />
                <Button text="Guardar" variant="primary" onClick={confirmSave} />
              </div>
            </div>
          }
        />
      </Modal>

      {/* Modal de Descartar Cambios */}
      <Modal isOpen={isDiscardModalOpen} onClose={closeDiscardModal}>
        <PrincipalCard
          title="Descartar Cambios"
          content={
            <div className="flex flex-col items-center gap-6 p-4">
              <p className="text-center text-custom-dark-blue">
                ¿Estás seguro de que deseas descartar los cambios?
                La información no se guardará.
              </p>
              <div className="flex flex-row gap-10">
                <Button text="Seguir Editando" variant="secondary" onClick={closeDiscardModal} />
                <Button text="Descartar" variant="primary" onClick={confirmDiscard} />
              </div>
            </div>
          }
        />
      </Modal>

      {/* Modal de Eliminar Paciente */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <PrincipalCard
          title="Confirmar Eliminación"
          content={
            <div className="flex flex-col items-center gap-6 p-4">
              <p className="text-center text-custom-dark-blue">
                ¿Estás seguro de que deseas eliminar este médico?
                Esta acción no se puede deshacer.
              </p>
              <div className="flex flex-row gap-10">
                <Button text="Cancelar" variant="secondary" onClick={closeDeleteModal} />
                <Button text="Eliminar" variant="primary" onClick={confirmDelete} />
              </div>
            </div>
          }
        />
      </Modal>
    </AnimatedPage>
  );
};

export default AdminDoctors;