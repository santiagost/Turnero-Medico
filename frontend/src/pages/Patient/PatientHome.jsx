import React, { useState } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import { useAuth } from '../../hooks/useAuth';

import SectionCard from '../../components/ui/SectionCard'
import ShiftList from '../../components/features/medicalShift/ShiftList';

// Importamos mock data y mock status
import { patientScheduleMock, mockShiftStatus } from '../../utils/mockData'; // <--- 1. Asegurate de importar mockShiftStatus
import NewMedicalShift from '../../components/features/schedule/newMedicalShift';

import Modal from '../../components/ui/Modal';
import PrincipalCard from '../../components/ui/PrincipalCard';
import Button from '../../components/ui/Button';

const PatientHome = () => {
  const { user } = useAuth()  
  const [patientSchedule, setPatientSchedule] = useState(patientScheduleMock);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [shiftToCancel, setShiftToCancel] = useState(null);

  const handleCancelShift = (id) => {
    const shift = patientSchedule.find(s => s.shiftId === id);
    
    if (shift && (shift.status.name === "Atendido" || shift.status.name === "Cancelado")) {
      alert(`Este turno ya ha sido ${shift.status.name.toLowerCase()} y no se puede modificar.`);
      return;
    }
    setShiftToCancel(id);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = () => {
    setPatientSchedule(prevSchedule =>
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

  return (
    <AnimatedPage>
      <div className="px-8">
        <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
          Mis Próximos Turnos
        </h1>

        <SectionCard content={
          <ShiftList
            shifts={patientSchedule}
            type={user.role}
            onCancel={handleCancelShift}
          />
        } />
        <SectionCard tittle={"Solicitar Nuevo Turno"} content={
          <NewMedicalShift user={user} />
        } />
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
    </AnimatedPage>
  );
}

export default PatientHome;