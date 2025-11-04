import React, { useState } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
// User Context
import { useAuth } from '../../hooks/useAuth';
// Feature
import ShiftList from '../../components/features/medicalShift/ShiftList';
import ShiftAttention from '../../components/features/medicalShift/ShiftAttention';
// UI
import SectionCard from '../../components/ui/SectionCard'
import PrincipalCard from '../../components/ui/PrincipalCard'
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

// Mock data
import { doctorScheduleMock, mockShiftStatus } from '../../utils/mockData';

const DoctorHome = () => {
  const { user } = useAuth();
  const [doctorSchedule, setDoctorSchedule] = useState(doctorScheduleMock);

  // Atencion de Turno
  const [attendingShift, setAttendingShift] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

  // Cancelar Turno
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [shiftToCancel, setShiftToCancel] = useState(null);

  // Registrar Consulta
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [dataToSave, setDataToSave] = useState(null);

  // Descartar
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);


  //  ----------------- Cancelar Turno ---------------
  const handleCancelShift = (id) => {
    const shift = doctorSchedule.find(s => s.shiftId === id);
    if (shift && (shift.status.name === "Atendido" || shift.status.name === "Cancelado")) {
      alert(`Este turno ya ha sido ${shift.status.name.toLowerCase()} y no se puede modificar.`);
      return;
    }
    if (selectedShift && selectedShift.shiftId === id) {
      alert("No puedes cancelar un turno que estás atendiendo.");
      return;
    }
    setShiftToCancel(id);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = () => {
    alert(`Cancelando turno ID: ${shiftToCancel}`);

    setDoctorSchedule(prevSchedule =>
      prevSchedule.map(shift =>
        shift.shiftId === shiftToCancel
          ? { ...shift, status: mockShiftStatus.cancelled }
          : shift
      )
    );
    setIsCancelModalOpen(false);
    setShiftToCancel(null);
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setShiftToCancel(null);
  };

  //  ----------------- Registrar Consulta ---------------
  const handleSaveAttention = (attentionData) => {
    console.log("Datos listos para guardar:", attentionData);
    setDataToSave(attentionData);
    setIsSaveModalOpen(true);
  };

  const confirmSave = () => {
    console.log("Guardando datos...", dataToSave);

    // --- AQUÍ VA TU LÓGICA DE BACKEND ---
    // (Ej: axios.post(`/api/consultations`, { shiftId: selectedShift.id, ...dataToSave }))

    setDoctorSchedule(prevSchedule =>
      prevSchedule.map(shift =>
        shift.shiftId === selectedShift.shiftId
          ? { ...shift, status: mockShiftStatus.attended }
          : shift
      )
    );

    setAttendingShift(false);
    setSelectedShift(null);
    setIsSaveModalOpen(false);
    setDataToSave(null);

    alert("Consulta registrada con éxito.");
  };

  const closeSaveModal = () => {
    setIsSaveModalOpen(false);
    setDataToSave(null);
  };

  //  ----------------- Atender Turno ---------------
  const handleAttendShift = (id) => {
    const shiftToAttend = doctorSchedule.find(shift => shift.shiftId === id);

    if (shiftToAttend) {
      setAttendingShift(true);
      setSelectedShift(shiftToAttend);
    } else {
      console.error("Error: No se encontró el turno con el ID:", id);
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
                <Button text="Volver" variant="secondary" onClick={closeCancelModal} />
                <Button text="Confirmar" variant="primary" onClick={confirmCancel} />
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
                <Button text="Seguir Editando" variant="secondary" onClick={closeSaveModal} />
                <Button text="Registrar" variant="primary" onClick={confirmSave} />
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
