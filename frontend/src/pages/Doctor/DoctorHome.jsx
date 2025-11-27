import React, { useState, useEffect, useCallback } from 'react';
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
import { createConsultation, deleteConsultation } from '../../../services/consultation.service'
import { createReceta } from '../../../services/medication.service';

import { useNavigate, useParams } from 'react-router-dom';

import { getNextShiftsForDoctor, cancelShiftById } from '../../../services/shift.service';

const DoctorHome = () => {
  const { user, profile } = useAuth();
  const { shiftId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const CURRENT_DOCTOR_ID = profile.doctorId;
  const [doctorSchedule, setDoctorSchedule] = useState([]);
  const [isLoadingShifts, setIsLoadingShifts] = useState(true);

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


  const fetchDoctorShifts = useCallback(async () => {
    if (!CURRENT_DOCTOR_ID) {
      setIsLoadingShifts(false);
      return;
    }

    setIsLoadingShifts(true);

    try {
      const data = await getNextShiftsForDoctor(CURRENT_DOCTOR_ID);

      setDoctorSchedule(data);

    } catch (error) {
      console.error("Error al cargar agenda:", error);
      // Mostrar mensaje de error si la carga falla
      const errorMessage = error.response?.data?.detail || "Error al cargar tu agenda de turnos.";
      toast.error(errorMessage);
      setDoctorSchedule([]);
    } finally {
      setIsLoadingShifts(false);
    }
  }, [CURRENT_DOCTOR_ID, toast]);


  useEffect(() => {
    fetchDoctorShifts();
  }, [fetchDoctorShifts]);

  // ----------------- Cargar Turno desde URL (y manejar estado de carga) ---------------

  useEffect(() => {
    if (shiftId && !isLoadingShifts) { // Solo busca si la lista ya se cargó
      const idToFind = Number(shiftId);
      const foundShift = doctorSchedule.find(s => s.shiftId === idToFind);

      if (foundShift) {
        setSelectedShift(foundShift);
        setAttendingShift(true);
      }
    }
  }, [shiftId, doctorSchedule, isLoadingShifts]);

  //  ----------------- Cancelar Turno ---------------
  const handleCancelShift = (id) => {
    const shift = doctorSchedule.find(s => s.shiftId === id);

    // Validaciones locales (mantener)
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
      await cancelShiftById(shiftToCancel);

      toast.success("Turno cancelado exitosamente.");

      // Limpieza del Modal
      setIsCancelModalOpen(false);
      setShiftToCancel(null);

      await fetchDoctorShifts();

    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.detail || "Ocurrió un error al intentar cancelar el turno.";
      toast.error(errorMessage);
    } finally {
      setLoadingCancel(false); // Desactivar spinner
    }
  };

  const closeCancelModal = () => {
    if (!loadingCancel) {
      setIsCancelModalOpen(false);
      setShiftToCancel(null);
    }
  };

  //  ----------------- Registrar Consulta ---------------
  const handleSaveAttention = (attentionData) => {
    setDataToSave(attentionData);
    setIsSaveModalOpen(true);
  };

  const confirmSave = async () => {
    setLoadingSave(true);

    const shiftIdToAttend = selectedShift.shiftId;
    const { diagnosis, treatment, personalNotes, medications } = dataToSave;

    let newConsultationId = null;

    try {
      if (!selectedShift || !dataToSave) {
        throw new Error("No hay turno seleccionado o datos para guardar.");
      }

      const consultationPayload = {
        shiftId: shiftIdToAttend,
        diagnosis: diagnosis,
        treatment: treatment,
        medicalNotes: personalNotes,
      };

      const newConsultation = await createConsultation(consultationPayload);
      newConsultationId = newConsultation.consultationId;

      let recipesCreated = 0;

      // 2. CREAR RECETAS
      if (medications.length > 0) {
        const recipesPromises = medications.map(med => {
          const recetaPayload = {
            consultationId: newConsultationId,
            medication: med.name,
            dosage: med.dosage,
            instructions: med.instructions,
          };
          return createReceta(recetaPayload);
        });

        // Si falla UNA receta, Promise.all detiene la ejecución y va al catch.
        await Promise.all(recipesPromises);
        recipesCreated = medications.length;
      }

      // --- ÉXITO TOTAL ---
      toast.success(`Consulta y ${recipesCreated} recetas registradas con éxito. 🎉`);

      await fetchDoctorShifts();
      setAttendingShift(false);
      setSelectedShift(null);
      setIsSaveModalOpen(false);
      setDataToSave(null);
      navigate("/doctor/home");

    } catch (error) {
      console.error("Error en la transacción:", error);

      // ROLLBACK: Solo si newConsultationId fue asignado (es decir, la consulta se creó)
      if (newConsultationId) {
        try {
          await deleteConsultation(newConsultationId);
          toast.error("Error al registrar recetas. La consulta ha sido ANULADA");
        } catch (rollbackError) {
          console.error("ERROR CRÍTICO EN ROLLBACK:", rollbackError);
          toast.error("¡ERROR CRÍTICO! Fallo en la anulación. Contacte a soporte.");
        }
      } else {
        const errorMessage = error.response?.data?.detail
          || error.message
          || "Error al guardar la consulta médica.";
        toast.error(errorMessage);
      }

    } finally {
      setLoadingSave(false);
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
                <Button text="Volver" variant="secondary" onClick={closeCancelModal} disable={loadingCancel} />
                <Button text="Confirmar" variant="primary" onClick={confirmCancel} isLoading={loadingCancel} />
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
                <Button text="Seguir Editando" variant="secondary" onClick={closeSaveModal} disable={loadingSave} />
                <Button text="Registrar" variant="primary" onClick={confirmSave} isLoading={loadingSave} />
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
