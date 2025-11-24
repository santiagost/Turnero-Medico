import React, { useState, useEffect } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
// User Context
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
// Feature
import ShiftList from '../../components/features/medicalShift/ShiftList';
import ShiftAttention from '../../components/features/medicalShift/ShiftAttention';
// UI
import SectionCard from '../../components/ui/SectionCard'
import PrincipalCard from '../../components/ui/PrincipalCard'
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

import { useNavigate, useParams } from 'react-router-dom';

// Mock data
import { doctorScheduleMock, mockShiftStatus } from '../../utils/mockData';

const DoctorHome = () => {
  const { user } = useAuth();
  const { shiftId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [doctorSchedule, setDoctorSchedule] = useState(doctorScheduleMock);

  // Atencion de Turno
  const [attendingShift, setAttendingShift] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

  // Cancelar Turno
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [shiftToCancel, setShiftToCancel] = useState(null);
  const [loadingCancel, setLoadingCancel] = useState(false);

  // Registrar Consulta
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [dataToSave, setDataToSave] = useState(null);
  const [loadingSave, setLoadingSave] = useState(false);

  // Descartar
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);


  // ----------------- Cargar Turno desde URL ---------------
  useEffect(() => {
    if (shiftId) {
      const idToFind = Number(shiftId);
      const foundShift = doctorSchedule.find(s => s.shiftId === idToFind);

      if (foundShift) {
        setSelectedShift(foundShift);
        setAttendingShift(true);
      }
    }
  }, [shiftId, doctorSchedule]);

  //  ----------------- Cancelar Turno ---------------
  const handleCancelShift = (id) => {
    const shift = doctorSchedule.find(s => s.shiftId === id);

    // Validaciones con Toast Warning
    if (shift && (shift.status.name === "Atendido" || shift.status.name === "Cancelado")) {
      toast.warning(`Este turno ya está ${shift.status.name.toLowerCase()} y no se puede cancelar.`);
      return;
    }
    if (selectedShift && selectedShift.shiftId === id) {
      toast.warning("No puedes cancelar un turno que estás atendiendo actualmente.");
      return;
    }

    setShiftToCancel(id);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    setLoadingCancel(true); // Activar spinner

    try {
      // AQUI VA LA LLAMADA AL BACKEND
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulación de error (Descomentar para probar)
      // await new Promise((_, reject) => setTimeout(() => reject(new Error("Fallo de red")), 2000));

      setDoctorSchedule(prevSchedule =>
        prevSchedule.map(shift =>
          shift.shiftId === shiftToCancel
            ? { ...shift, status: mockShiftStatus.cancelled }
            : shift
        )
      );

      toast.success("Turno cancelado exitosamente.");
      setIsCancelModalOpen(false);
      setShiftToCancel(null);

    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al intentar cancelar el turno.");
    } finally {
      setLoadingCancel(false); // Desactivar spinner
    }
  };

  const closeCancelModal = () => {
    if (!loadingCancel) { // Evitar cerrar si está cargando
      setIsCancelModalOpen(false);
      setShiftToCancel(null);
    }
  };

  //  ----------------- Registrar Consulta ---------------
  const handleSaveAttention = (attentionData) => {
        console.log("Datos listos para guardar:", attentionData);
    setDataToSave(attentionData);
    setIsSaveModalOpen(true);
  };

  const confirmSave = async () => {
    setLoadingSave(true); // Activar spinner

    try {
      // AQUI VA LA LLAMADA AL BACKEND
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Actualizar estado local
      setDoctorSchedule(prevSchedule =>
        prevSchedule.map(shift =>
          shift.shiftId === selectedShift.shiftId
            ? { ...shift, status: mockShiftStatus.attended }
            : shift
        )
      );

      toast.success("Consulta registrada con éxito.");

      // Limpieza y redirección
      setAttendingShift(false);
      setSelectedShift(null);
      setIsSaveModalOpen(false);
      setDataToSave(null);
      navigate("/doctor/home");

    } catch (error) {
      console.error(error);
      toast.error("Error al guardar la consulta médica.");
    } finally {
      setLoadingSave(false); // Desactivar spinner
    }
  };

  const closeSaveModal = () => {
    if (!loadingSave) {
      setIsSaveModalOpen(false);
      setDataToSave(null);
    }
  };

  //  ----------------- Atender Turno ---------------
  const handleAttendShift = (id) => {
    const shiftToAttend = doctorSchedule.find(shift => shift.shiftId === id);

    if (shiftToAttend) {
      setAttendingShift(true);
      setSelectedShift(shiftToAttend);
    } else {
      toast.error("Error: No se encontró el turno solicitado.");
    }
  };

  // --------------- Descartar Consulta ------------
  const handleDiscardAttention = () => {
    setIsDiscardModalOpen(true);
  };

  const confirmDiscard = () => {
    setAttendingShift(false);
    setSelectedShift(null);
    setIsDiscardModalOpen(false);
    navigate("/doctor/home");
    toast.info("Has salido sin guardar cambios.");
  };

  const closeDiscardModal = () => {
    setIsDiscardModalOpen(false);
  };

  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Próximos Turnos
        </h1>

        <SectionCard content={
          <ShiftList
            shifts={doctorSchedule}
            type={user.role}
            onAttend={handleAttendShift}
            onCancel={handleCancelShift}
          />
        } />
        {attendingShift && selectedShift && (
          <SectionCard tittle={"Atendiendo Turno"}
            content={
              <ShiftAttention
                shift={selectedShift}
                onSave={handleSaveAttention}
                onDiscard={handleDiscardAttention}
              />
            }
          />
        )}
      </div>

      {/* Modal de Cancelación */}
      <Modal isOpen={isCancelModalOpen} onClose={closeCancelModal}>
        <PrincipalCard
          title="Confirmar Cancelación"
          content={
            <div className="flex flex-col items-center gap-6 p-2">
              <p className="text-center text-custom-dark-blue">
                ¿Estás seguro de que deseas cancelar este turno?
                Esta acción no se puede deshacer.
              </p>
              <div className="flex flex-row gap-10">
                <Button text="Volver" variant="secondary" onClick={closeCancelModal} disable={loadingCancel}/>
                <Button text="Confirmar" variant="primary" onClick={confirmCancel} isLoading={loadingCancel}/>
              </div>
            </div>
          }
        />
      </Modal>

      {/* Modal de Guardar Consulta */}
      <Modal isOpen={isSaveModalOpen} onClose={closeSaveModal}>
        <PrincipalCard
          title="Registrar Consulta"
          content={
            <div className="flex flex-col items-center gap-6 p-4">
              <p className="text-center text-custom-dark-blue">
                ¿Estás seguro de que deseas registrar esta consulta?
                Los datos se guardarán en el historial del paciente.
              </p>
              <div className="flex flex-row gap-10">
                <Button text="Seguir Editando" variant="secondary" onClick={closeSaveModal} disable={loadingSave}/>
                <Button text="Registrar" variant="primary" onClick={confirmSave} isLoading={loadingSave}/>
              </div>
            </div>
          }
        />
      </Modal>

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
    </AnimatedPage>
  );
}

export default DoctorHome;
