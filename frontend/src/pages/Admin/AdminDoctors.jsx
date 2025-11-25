import React, { useState, useEffect, useRef } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import SectionCard from '../../components/ui/SectionCard';
import AdminNewDoctor from '../../components/features/adminDataManagement/create/AdminNewDoctor';
import AdminDoctorFilterPanel from '../../components/features/filterPanel/admin/AdminDoctorFilterPanel';
import Button from '../../components/ui/Button';
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useOutletContext } from 'react-router-dom';
import AdminEditDoctor from '../../components/features/adminDataManagement/edit/AdminEditDoctor';

import Modal from '../../components/ui/Modal';
import PrincipalCard from '../../components/ui/PrincipalCard';
import AdminDoctorSchedulePanel from '../../components/features/adminDataManagement/edit/AdminDoctorSchedulePanel';
import { useToast } from '../../hooks/useToast';

const AdminDoctors = () => {
  const [showNewDoctor, setShowNewDoctor] = useState(false);
  const toggleNewDoctor = () => setShowNewDoctor(prev => !prev);
  const { doctorId } = useParams();
  const toast = useToast();
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorId ? parseInt(doctorId) : "");

  const [loadingSave, setLoadingSave] = useState(false);   // Para editar datos personales
  const [loadingDelete, setLoadingDelete] = useState(false);

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

  const detailSectionRef = useRef(null);
  const { scrollContainerRef } = useOutletContext();

  useEffect(() => {
    if (selectedDoctorId && detailSectionRef.current && scrollContainerRef.current) {

      const timerId = setTimeout(() => {
        const targetPosition = detailSectionRef.current.offsetTop;
        scrollContainerRef.current.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      }, 300);
      return () => clearTimeout(timerId);
    }
  }, [selectedDoctorId]);

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


  const handleScheduleSave = async (updatedSchedule) => {
    console.log("Guardando horario...", updatedSchedule);

    try {
      // AQUI VA LA LLAMADA AL BACKEND
      // await axios.put(...)
      toast.info("Guardando configuración horaria...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Horarios actualizados correctamente.");
      setSelectedDoctorId(null); 

    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar los horarios.");
    }
  };

  const handleCancel = () => {
    setIsDiscardModalOpen(true);
  }

  const confirmSave = async () => {
    setLoadingSave(true); // Activar spinner

    try {
      // AQUI VA LA LLAMADA AL BACKEND
      // await axios.put(`/api/doctors/${selectedDoctorId}`, dataToSave);

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulación

      // Simulación de error
      // throw new Error("Email duplicado");

      console.log("Datos guardados:", dataToSave);

      toast.success("Datos del médico actualizados correctamente.");

      setIsSaveModalOpen(false);
      setDataToSave(null);
      setSelectedDoctorId(null); // Cierra el panel de edición

    } catch (error) {
      console.error("Error al guardar:", error);
      const errorMsg = error.response?.data?.message || "Ocurrió un error al guardar los cambios.";
      toast.error(errorMsg);
    } finally {
      setLoadingSave(false); // Desactivar spinner
    }
  };

  const confirmDelete = async () => {
    setLoadingDelete(true); // Activar spinner

    try {
      // AQUI VA LA LLAMADA AL BACKEND
      // await axios.delete(`/api/doctors/${doctorIdToDelete}`);

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulación

      console.log("Doctor eliminado ID:", doctorIdToDelete);

      toast.success("Médico eliminado del sistema.");

      setIsDeleteModalOpen(false);
      setDoctorIdToDelete(null);

      // Si el doctor eliminado era el que se estaba editando, cerramos el panel
      if (selectedDoctorId === doctorIdToDelete) {
        setSelectedDoctorId(null);
      }

      // Aquí podrías disparar un refresh de la lista si tuvieras un estado global o context

    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("No se pudo eliminar al médico. Verifica que no tenga turnos pendientes.");
    } finally {
      setLoadingDelete(false); // Desactivar spinner
    }
  };

  const closeDeleteModal = () => {
    if (!loadingDelete) {
      setIsDeleteModalOpen(false);
      setDoctorIdToDelete(null);
    }
  };

  const closeSaveModal = () => {
    if (!loadingSave) {
      setIsSaveModalOpen(false);
      setDataToSave(null);
    }
  };

  const confirmDiscard = () => {
    setIsDiscardModalOpen(false);
    setSelectedDoctorId(null);
    toast.info("Cambios descartados.");
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
              ref={detailSectionRef}
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
              <SectionCard tittle={"Definir el Horario de Atención del Médico"} content={

                <AdminDoctorSchedulePanel
                  doctorId={selectedDoctorId}
                  onSaveSuccess={handleScheduleSave}
                />
              } />
            </motion.div>
          }
        </AnimatePresence>

      </div>
      {/* Modal de Guardar Cambios (Datos Personales) */}
      <Modal isOpen={isSaveModalOpen} onClose={closeSaveModal}>
        <PrincipalCard
          title="Guardar Cambios"
          content={
            <div className="flex flex-col items-center gap-6 p-4">
              <p className="text-center text-custom-dark-blue">
                ¿Estás seguro de que deseas guardar los cambios en este médico?
              </p>
              <div className="flex flex-row gap-10">
                <Button text="Seguir Editando" variant="secondary" onClick={closeSaveModal} disable={loadingSave} />
                <Button text="Guardar" variant="primary" onClick={confirmSave} isLoading={loadingSave} />
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

      {/* Modal de Eliminar Médico */}
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
                <Button text="Cancelar" variant="secondary" onClick={closeDeleteModal} disable={loadingDelete} />
                <Button text="Eliminar" variant="primary" onClick={confirmDelete} isLoading={loadingDelete} />
              </div>
            </div>
          }
        />
      </Modal>
    </AnimatedPage>
  );
};

export default AdminDoctors;