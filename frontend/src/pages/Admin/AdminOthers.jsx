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
import Modal from '../../components/ui/Modal'
import PrincipalCard from '../../components/ui/PrincipalCard'

const AdminOthers = () => {
  const [showNewSocialWork, setShowNewSocialWork] = useState(false);
  const [showNewSpecialty, setShowNewSpecialty] = useState(false);
  const toggleSocialWork = () => setShowNewSocialWork(prev => !prev);
  const toggleSpecialty = () => setShowNewSpecialty(prev => !prev);

  const [selectedSocialWorkId, setSelectedSocialWorkId] = useState(null);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(null);

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

  const confirmSaveSpecialty = () => {
    console.log("Guardando cambios en la especialidad:", specialtyToSave);
    // ... Aquí iría tu lógica de API para actualizar al paciente ...

    setIsSaveModalSpecialtyOpen(false);
    setSpecialtyToSave(null);
    setSelectedSpecialtyId();
  };

  const confirmDeleteSpecialty = () => {
    console.log("Eliminando especialidad ID:", specialtyIdToDelete);
    // ... Aquí iría tu lógica de API para eliminar al paciente ...

    // Simulación: Muestra alerta y cierra
    setIsDeleteModalSpecialtyOpen(false);
    setSpecialtyIdToDelete(null);
    // Aquí deberías re-ejecutar la búsqueda en AdminDoctorFilterPanel
    // para que la lista se actualice.
  };

  const closeDeleteModalSpecialty = () => {
    setIsDeleteModalSpecialtyOpen(false);
    setSpecialtyIdToDelete(null);
  };

  const closeSaveModalSpecialty = () => {
    setIsSaveModalSpecialtyOpen(false);
    setSpecialtyToSave(null);
  };

  const confirmDiscardSpecialty = () => {
    setIsDiscardModalSpecialtyOpen(false);
    setSelectedSpecialtyId(null);
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

  const confirmSaveSocialWork = () => {
    // Corregido: Muestra los datos a guardar (socialWorkToSave)
    console.log("Guardando cambios en la obra social:", socialWorkToSave);
    // ... Aquí iría tu lógica de API para actualizar la obra social ...

    setIsSaveModalSocialWorkOpen(false);
    setSocialWorkToSave(null);
    setSelectedSocialWorkId(null); // Limpia la selección
  };

  const confirmDeleteSocialWork = () => {
    // Corregido: Muestra el ID a eliminar
    console.log("Eliminando obra social ID:", socialWorkIdToDelete);
    // ... Aquí iría tu lógica de API para eliminar la obra social ...

    setIsDeleteModalSocialWorkOpen(false);
    setSocialWorkIdToDelete(null);
    // Aquí deberías re-ejecutar la búsqueda de obras sociales
    // para que la lista se actualice.
  };

  const closeDeleteModalSocialWork = () => {
    setIsDeleteModalSocialWorkOpen(false);
    setSocialWorkIdToDelete(null);
  };

  const closeSaveModalSocialWork = () => {
    setIsSaveModalSocialWorkOpen(false);
    setSocialWorkToSave(null);
  };

  const confirmDiscardSocialWork = () => {
    setIsDiscardModalSocialWorkOpen(false);
    setSelectedSocialWorkId(null);
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
          <AdminSocialWorkFilterPanel  socialWorkToEdit={handleSocialWorkToEdit} socialWorkToDelete={handleSocialWorkToDelete}/>
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
          <AdminSpecialtyFilterPanel specialtyToEdit={handleSpecialtyToEdit} specialtyToDelete={handleSpecialtyToDelete}/>
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
                <Button text="Seguir Editando" variant="secondary" onClick={closeSaveModalSpecialty} />
                <Button text="Guardar" variant="primary" onClick={confirmSaveSpecialty} />
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
                <Button text="Cancelar" variant="secondary" onClick={closeDeleteModalSpecialty} />
                <Button text="Eliminar" variant="primary" onClick={confirmDeleteSpecialty} />
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
                <Button text="Seguir Editando" variant="secondary" onClick={closeSaveModalSocialWork} />
                <Button text="Guardar" variant="primary" onClick={confirmSaveSocialWork} />
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
                <Button text="Cancelar" variant="secondary" onClick={closeDeleteModalSocialWork} />
                <Button text="Eliminar" variant="primary" onClick={confirmDeleteSocialWork} />
              </div>
            </div>
          }
        />
      </Modal>
    </AnimatedPage>
  );
};
export default AdminOthers;
