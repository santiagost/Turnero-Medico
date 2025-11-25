import React, { useState, useEffect, useRef } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import SectionCard from '../../components/ui/SectionCard';
import AdminNewSocialWork from '../../components/features/adminDataManagement/create/AdminNewSocialWork';
import AdminNewSpecialty from '../../components/features/adminDataManagement/create/AdminNewSpecialty';
import AdminSocialWorkFilterPanel from '../../components/features/filterPanel/admin/AdminSocialWorkFilterPanel';
import AdminSpecialtyFilterPanel from '../../components/features/filterPanel/admin/AdminSpecialtyFilterPanel';
import Button from '../../components/ui/Button';
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from 'framer-motion'
import { useOutletContext } from 'react-router-dom'
import AdminEditSocialWork from '../../components/features/adminDataManagement/edit/AdminEditSocialWork';
import AdminEditSpecialty from '../../components/features/adminDataManagement/edit/AdminEditSpecialty';
import Modal from '../../components/ui/Modal';
import PrincipalCard from '../../components/ui/PrincipalCard';
import { useToast } from '../../hooks/useToast';

import { deleteSpecialty, editSpecialty } from '../../../services/specialty.service';
import { deleteSocialWork, editSocialWork } from '../../../services/socialWork.service';

const AdminOthers = () => {
  const toast = useToast();
  const [showNewSocialWork, setShowNewSocialWork] = useState(false);
  const [showNewSpecialty, setShowNewSpecialty] = useState(false);
  const toggleSocialWork = () => setShowNewSocialWork(prev => !prev);
  const toggleSpecialty = () => setShowNewSpecialty(prev => !prev);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedSocialWorkId, setSelectedSocialWorkId] = useState(null);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(null);

  const [loadingSaveSocialWork, setLoadingSaveSocialWork] = useState(false);
  const [loadingDeleteSocialWork, setLoadingDeleteSocialWork] = useState(false);
  const [loadingSaveSpecialty, setLoadingSaveSpecialty] = useState(false);
  const [loadingDeleteSpecialty, setLoadingDeleteSpecialty] = useState(false);

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

  const editSocialWorkRef = useRef(null);
  const editSpecialtyRef = useRef(null);
  const { scrollContainerRef } = useOutletContext();

  useEffect(() => {
    if (selectedSocialWorkId && editSocialWorkRef.current && scrollContainerRef.current) {

      const timerId = setTimeout(() => {
        const targetPosition = editSocialWorkRef.current.offsetTop;
        scrollContainerRef.current.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      }, 300);
      return () => clearTimeout(timerId);
    }
  }, [selectedSocialWorkId]);

  useEffect(() => {
    if (selectedSpecialtyId && editSpecialtyRef.current && scrollContainerRef.current) {

      const timerId = setTimeout(() => {
        const targetPosition = editSpecialtyRef.current.offsetTop;
        scrollContainerRef.current.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      }, 300);
      return () => clearTimeout(timerId);
    }
  }, [selectedSpecialtyId]);

  const [isSaveModalSpecialtyOpen, setIsSaveModalSpecialtyOpen] = useState(false);
  const [isDiscardModalSpecialtyOpen, setIsDiscardModalSpecialtyOpen] = useState(false);
  const [isDeleteModalSpecialtyOpen, setIsDeleteModalSpecialtyOpen] = useState(false);
  const [specialtyIdToDelete, setSpecialtyIdToDelete] = useState(null);
  const [specialtyToSave, setSpecialtyToSave] = useState(null);

  const handleSpecialtyToDelete = (id) => {
    setSpecialtyIdToDelete(id);
    setIsDeleteModalSpecialtyOpen(true);
  }
  const handleSpecialtyToEdit = (id) => {
    setSelectedSpecialtyId(id)
  }

  const handleSaveSpecialty = (specialtyData) => {
    setSpecialtyToSave(specialtyData);
    setIsSaveModalSpecialtyOpen(true);
  }

  const handleCancelSpecialty = () => {
    setIsDiscardModalSpecialtyOpen(true);
  }

  const confirmSaveSpecialty = async () => {
    setLoadingSaveSpecialty(true);
    try {      
      const data = await editSpecialty(specialtyToSave.specialtyId, specialtyToSave);
      setRefreshTrigger(prev => prev + 1);

      toast.success("Especialidad actualizada correctamente.");

      setIsSaveModalSpecialtyOpen(false);
      setSpecialtyToSave(null);
      setSelectedSpecialtyId(null); // Cerrar edición
    } catch (error) {
      toast.error("Error al guardar la especialidad.");
      console.error(error);
    } finally {
      setLoadingSaveSpecialty(false);
    }
  };

  const confirmDeleteSpecialty = async () => {
    setLoadingDeleteSpecialty(true);
    try {
      console.log("Eliminando especialidad ID:", specialtyIdToDelete);
      const data = await deleteSpecialty(specialtyIdToDelete)
      setRefreshTrigger(prev => prev + 1);

      toast.success("Especialidad eliminada correctamente.");

      setIsDeleteModalSpecialtyOpen(false);

      // Si eliminamos la que estamos editando, cerramos el panel
      if (selectedSpecialtyId === specialtyIdToDelete) {
        setSelectedSpecialtyId(null);
      }
      setSpecialtyIdToDelete(null);

    } catch (error) {
      toast.error("Error al eliminar la especialidad. Verifique que no esté en uso.");
      console.error(error);
    } finally {
      setLoadingDeleteSpecialty(false);
    }
  };

  const closeDeleteModalSpecialty = () => {
    if (!loadingDeleteSpecialty) {
      setIsDeleteModalSpecialtyOpen(false);
      setSpecialtyIdToDelete(null);
    }
  };

  const closeSaveModalSpecialty = () => {
    if (!loadingSaveSpecialty) {
      setIsSaveModalSpecialtyOpen(false);
      setSpecialtyToSave(null);
    }
  };

  const confirmDiscardSpecialty = () => {
    setIsDiscardModalSpecialtyOpen(false);
    setSelectedSpecialtyId(null);
    toast.info("Cambios descartados.");
  };

  const closeDiscardModalSpecialty = () => {
    setIsDiscardModalSpecialtyOpen(false);
  };

  const [isSaveModalSocialWorkOpen, setIsSaveModalSocialWorkOpen] = useState(false);
  const [isDiscardModalSocialWorkOpen, setIsDiscardModalSocialWorkOpen] = useState(false);
  const [isDeleteModalSocialWorkOpen, setIsDeleteModalSocialWorkOpen] = useState(false);
  const [socialWorkIdToDelete, setSocialWorkIdToDelete] = useState(null);
  const [socialWorkToSave, setSocialWorkToSave] = useState(null);

  const handleSocialWorkToDelete = (id) => {
    setSocialWorkIdToDelete(id);
    setIsDeleteModalSocialWorkOpen(true);
  }
  const handleSocialWorkToEdit = (id) => {
    setSelectedSocialWorkId(id)
  }

  const handleSaveSocialWork = (socialWorkData) => {
    setSocialWorkToSave(socialWorkData);
    setIsSaveModalSocialWorkOpen(true);
  }

  const handleCancelSocialWork = () => {
    setIsDiscardModalSocialWorkOpen(true);
  }

  const confirmSaveSocialWork = async () => {
    setLoadingSaveSocialWork(true);
    try {
      // AQUI VA LA LLAMADA AL BACKEND
      const data = await editSocialWork(socialWorkToSave.socialWorkId, socialWorkToSave);
      setRefreshTrigger(prev => prev + 1);

      toast.success("Obra Social actualizada correctamente.");

      setIsSaveModalSocialWorkOpen(false);
      setSocialWorkToSave(null);
      setSelectedSocialWorkId(null);
    } catch (error) {
      toast.error("Error al guardar la obra social.");
      console.error(error);
    } finally {
      setLoadingSaveSocialWork(false);
    }
  };


  const confirmDeleteSocialWork = async () => {
    setLoadingDeleteSocialWork(true);
    try {      
      console.log("Eliminando obra social ID:", socialWorkIdToDelete);
      const data = await deleteSocialWork(socialWorkIdToDelete)
      setRefreshTrigger(prev => prev + 1);

      toast.success("Obra Social eliminada correctamente.");

      setIsDeleteModalSocialWorkOpen(false);

      if (selectedSocialWorkId === socialWorkIdToDelete) {
        setSelectedSocialWorkId(null);
      }
      setSocialWorkIdToDelete(null);
    } catch (error) {
      toast.error("Error al eliminar la obra social. Verifique que no esté asignada a pacientes.");
      console.error(error);
    } finally {
      setLoadingDeleteSocialWork(false);
    }
  };

  const closeDeleteModalSocialWork = () => {
    if (!loadingDeleteSocialWork) {
      setIsDeleteModalSocialWorkOpen(false);
      setSocialWorkIdToDelete(null);
    }
  };

  const closeSaveModalSocialWork = () => {
    if (!loadingSaveSocialWork) {
      setIsSaveModalSocialWorkOpen(false);
      setSocialWorkToSave(null);
    }
  };

  const confirmDiscardSocialWork = () => {
    setIsDiscardModalSocialWorkOpen(false);
    setSelectedSocialWorkId(null);
    toast.info("Cambios descartados.");
  };

  const closeDiscardModalSocialWork = () => {
    setIsDiscardModalSocialWorkOpen(false);
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
                <AdminNewSocialWork refresh={setRefreshTrigger} />
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
                <AdminNewSpecialty refresh={setRefreshTrigger} />
              } />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Las secciones de búsqueda siempre están visibles */}
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6 mt-8">
          Listado de Obras Sociales
        </h1>
        <SectionCard tittle={"Buscar Obra Social"} content={
          <AdminSocialWorkFilterPanel socialWorkToEdit={handleSocialWorkToEdit} socialWorkToDelete={handleSocialWorkToDelete} refreshTrigger={refreshTrigger}/>
        } />

        <AnimatePresence>
          {selectedSocialWorkId &&
            <motion.div
              key="edit-social-work"
              ref={editSocialWorkRef}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ overflow: 'hidden' }}
            >
              <h1 className="text-2xl font-bold text-custom-dark-blue mb-6 mt-8">
                Detalle de Obra Social
              </h1>
              <SectionCard tittle={"Editar Obra Social"} content={
                <AdminEditSocialWork socialWorkId={selectedSocialWorkId} onSave={handleSaveSocialWork} onCancel={handleCancelSocialWork} />
              } />
            </motion.div>
          }
        </AnimatePresence>

        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6 mt-8">
          Listado de Especialidades
        </h1>
        <SectionCard tittle={"Buscar Especialidad"} content={
          <AdminSpecialtyFilterPanel specialtyToEdit={handleSpecialtyToEdit} specialtyToDelete={handleSpecialtyToDelete} refreshTrigger={refreshTrigger}/>
        } />

        <AnimatePresence>
          {selectedSpecialtyId &&
            <motion.div
              key="edit-specialty"
              ref={editSpecialtyRef}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{ overflow: 'hidden' }}
            >
              <h1 className="text-2xl font-bold text-custom-dark-blue mb-6 mt-8">
                Detalle de Especialidad
              </h1>
              <SectionCard tittle={"Editar Especialidad"} content={
                <AdminEditSpecialty specialtyId={selectedSpecialtyId} onSave={handleSaveSpecialty} onCancel={handleCancelSpecialty} />
              } />
            </motion.div>
          }
        </AnimatePresence>
      </div>

      {/* Modal de Guardar Cambios (Especialidad) */}
      <Modal isOpen={isSaveModalSpecialtyOpen} onClose={closeSaveModalSpecialty}>
        <PrincipalCard
          title="Guardar Cambios"
          content={
            <div className="flex flex-col items-center gap-6 p-4">
              <p className="text-center text-custom-dark-blue">
                ¿Estás seguro de que deseas guardar los cambios en esta especialidad?
              </p>
              <div className="flex flex-row gap-10">
                <Button text="Seguir Editando" variant="secondary" onClick={closeSaveModalSpecialty} disable={loadingSaveSpecialty} />
                <Button text="Guardar" variant="primary" onClick={confirmSaveSpecialty} isLoading={loadingSaveSpecialty} />
              </div>
            </div>
          }
        />
      </Modal>

      {/* Modal de Descartar Cambios (Especialidad) */}
      <Modal isOpen={isDiscardModalSpecialtyOpen} onClose={closeDiscardModalSpecialty}>
        <PrincipalCard
          title="Descartar Cambios"
          content={
            <div className="flex flex-col items-center gap-6 p-4">
              <p className="text-center text-custom-dark-blue">
                ¿Estás seguro de que deseas descartar los cambios?
                La información no se guardará.
              </p>
              <div className="flex flex-row gap-10">
                <Button text="Seguir Editando" variant="secondary" onClick={closeDiscardModalSpecialty} />
                <Button text="Descartar" variant="primary" onClick={confirmDiscardSpecialty} />
              </div>
            </div>
          }
        />
      </Modal>

      {/* Modal de Eliminar Especialidad */}
      <Modal isOpen={isDeleteModalSpecialtyOpen} onClose={closeDeleteModalSpecialty}>
        <PrincipalCard
          title="Confirmar Eliminación"
          content={
            <div className="flex flex-col items-center gap-6 p-4">
              <p className="text-center text-custom-dark-blue">
                ¿Estás seguro de que deseas eliminar esta especialidad?
                Esta acción no se puede deshacer.
              </p>
              <div className="flex flex-row gap-10">
                <Button text="Cancelar" variant="secondary" onClick={closeDeleteModalSpecialty} disable={loadingDeleteSpecialty}/>
                <Button text="Eliminar" variant="primary" onClick={confirmDeleteSpecialty} isLoading={loadingDeleteSpecialty} />
              </div>
            </div>
          }
        />
      </Modal>

      {/* Modal de Guardar Cambios (Obra Social) */}
      <Modal isOpen={isSaveModalSocialWorkOpen} onClose={closeSaveModalSocialWork}>
        <PrincipalCard
          title="Guardar Cambios"
          content={
            <div className="flex flex-col items-center gap-6 p-4">
              <p className="text-center text-custom-dark-blue">
                ¿Estás seguro de que deseas guardar los cambios en esta obra social?
              </p>
              <div className="flex flex-row gap-10">
                <Button text="Seguir Editando" variant="secondary" onClick={closeSaveModalSocialWork} disable={loadingSaveSocialWork}/>
                <Button text="Guardar" variant="primary" onClick={confirmSaveSocialWork} isLoading={loadingSaveSocialWork} />
              </div>
            </div>
          }
        />
      </Modal>

      {/* Modal de Descartar Cambios (Obra Social) */}
      <Modal isOpen={isDiscardModalSocialWorkOpen} onClose={closeDiscardModalSocialWork}>
        <PrincipalCard
          title="Descartar Cambios"
          content={
            <div className="flex flex-col items-center gap-6 p-4">
              <p className="text-center text-custom-dark-blue">
                ¿Estás seguro de que deseas descartar los cambios?
                La información no se guardará.
              </p>
              <div className="flex flex-row gap-10">
                <Button text="Seguir Editando" variant="secondary" onClick={closeDiscardModalSocialWork} />
                <Button text="Descartar" variant="primary" onClick={confirmDiscardSocialWork} />
              </div>
            </div>
          }
        />
      </Modal>

      {/* Modal de Eliminar Obra Social */}
      <Modal isOpen={isDeleteModalSocialWorkOpen} onClose={closeDeleteModalSocialWork}>
        <PrincipalCard
          title="Confirmar Eliminación"
          content={
            <div className="flex flex-col items-center gap-6 p-4">
              <p className="text-center text-custom-dark-blue">
                ¿Estás seguro de que deseas eliminar esta obra social?
                Esta acción no se puede deshacer.
              </p>
              <div className="flex flex-row gap-10">
                <Button text="Cancelar" variant="secondary" onClick={closeDeleteModalSocialWork} disable={loadingDeleteSocialWork} />
                <Button text="Eliminar" variant="primary" onClick={confirmDeleteSocialWork} isLoading={loadingDeleteSocialWork} />
              </div>
            </div>
          }
        />
      </Modal>
    </AnimatedPage>
  );
};
export default AdminOthers;
