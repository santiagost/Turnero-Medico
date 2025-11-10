import React, { useEffect, useState } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import SectionCard from '../../components/ui/SectionCard';
import AdminNewPatient from '../../components/features/adminDataManagement/create/AdminNewPatient';
import AdminPatientFilterPanel from '../../components/features/filterPanel/admin/AdminPatientFilterPanel';
import Button from '../../components/ui/Button';
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import AdminEditPatient from '../../components/features/adminDataManagement/edit/AdminEditPatient';

import Modal from '../../components/ui/Modal';
import PrincipalCard from '../../components/ui/PrincipalCard';

const AdminPatients = () => {
  const [showNewPatient, setShowNewPatient] = useState(false);
  const toggleNewPatient = () => setShowNewPatient(prev => !prev);
  const { patientId } = useParams();
  const [selectedPatientId, setSelectedPatientId] = useState(patientId ? parseInt(patientId) : "");

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
  const [patientIdToDelete, setPatientIdToDelete] = useState(null);
  const [dataToSave, setDataToSave] = useState(null);

  const handlePatientToDelete = (id) => {
    setPatientIdToDelete(id);
    setIsDeleteModalOpen(true);
  }
  const handlePatientToEdit = (id) => {
    setSelectedPatientId(id)
  }

  const handleSave = (patientData) => {
    setDataToSave(patientData);
    setIsSaveModalOpen(true);
  }

  const handleCancel = () => {
    setIsDiscardModalOpen(true);
  }

  const confirmDelete = () => {
    console.log("Eliminando paciente ID:", patientIdToDelete);
    // ... Aquí iría tu lógica de API para eliminar al paciente ...

    // Simulación: Muestra alerta y cierra
    setIsDeleteModalOpen(false);
    setPatientIdToDelete(null);
    // Aquí deberías re-ejecutar la búsqueda en AdminPatientFilterPanel
    // para que la lista se actualice.
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPatientIdToDelete(null);
  };

  const confirmSave = () => {
    console.log("Guardando cambios en el paciente:", dataToSave);
    // ... Aquí iría tu lógica de API para actualizar al paciente ...

    setIsSaveModalOpen(false);
    setDataToSave(null);
    setSelectedPatientId(null);
  };

  const closeSaveModal = () => {
    setIsSaveModalOpen(false);
    setDataToSave(null);
  };

  const confirmDiscard = () => {
    setIsDiscardModalOpen(false);
    setSelectedPatientId(null);
  };

  const closeDiscardModal = () => {
    setIsDiscardModalOpen(false);
  };

  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Gestión de Pacientes
        </h1>

        <div className='flex flex-row gap-4 items-center w-full mb-6'>
          <Button
            icon={showNewPatient ? <IoMdClose size={25} /> : ""}
            text={"Registrar Nuevo Paciente"}
            variant={!showNewPatient ? "primary" : "secondary"}
            onClick={toggleNewPatient}
            type={"button"}
            size={"big"}
          />
        </div>

        <AnimatePresence>
          {showNewPatient && (
            <motion.div
              key="new-patient"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ overflow: 'hidden' }}
            >
              <SectionCard tittle={"Crear Paciente"} content={
                <AdminNewPatient />
              } />
            </motion.div>
          )}
        </AnimatePresence>

        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6 mt-8">
          Buscar Pacientes
        </h1>
        <SectionCard tittle={"Buscar Paciente"} content={
          <AdminPatientFilterPanel viewMode="admin" patientToDelete={handlePatientToDelete} patientToEdit={handlePatientToEdit} />
        } />

        <AnimatePresence>
          {selectedPatientId &&
            <motion.div
              key="edit-doctor"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ overflow: 'hidden' }}
            >
              <h1 className="text-2xl font-bold text-custom-dark-blue mb-6 mt-8">
                Detalle del Paciente
              </h1>
              <SectionCard tittle={"Editar Paciente"} content={
                <AdminEditPatient patientId={selectedPatientId} onSave={handleSave} onCancel={handleCancel} />
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
                ¿Estás seguro de que deseas guardar los cambios en este paciente?
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
                ¿Estás seguro de que deseas eliminar este paciente?
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

export default AdminPatients;