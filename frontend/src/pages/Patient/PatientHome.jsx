import React, { useState, useEffect, useCallback } from 'react';
import AnimatedPage from '../../components/layout/AnimatedPage';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

import SectionCard from '../../components/ui/SectionCard'
import ShiftList from '../../components/features/medicalShift/ShiftList';
import Spinner from '../../components/ui/Spinner';

import NewMedicalShift from '../../components/features/schedule/newMedicalShift';

import Modal from '../../components/ui/Modal';
import PrincipalCard from '../../components/ui/PrincipalCard';
import Button from '../../components/ui/Button';


import { getNextShiftsForPatient } from '../../../services/shift.service';
import { cancelShiftById } from '../../../services/shift.service';


const PatientHome = () => {
    const { user, profile } = useAuth();
    const toast = useToast();

    const CURRENT_PATIENT = profile.patientId;

    const [patientSchedule, setPatientSchedule] = useState([]); 
    const [isLoadingShifts, setIsLoadingShifts] = useState(true); 

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [shiftToCancel, setShiftToCancel] = useState(null);
    const [loadingCancel, setLoadingCancel] = useState(false); 


    const fetchPatientShifts = useCallback(async () => {
        if (!user || !user.userId) {
            setIsLoadingShifts(false);
            return;
        }

        setIsLoadingShifts(true);

        try {
            const data = await getNextShiftsForPatient(3) //CURRENT_PATIENT
            setPatientSchedule(data);

        } catch (error) {
            console.error("Error al cargar turnos:", error);
            toast.error("Error al cargar tus próximos turnos.");
            setPatientSchedule([]); 
        } finally {
            setIsLoadingShifts(false);
        }
    }, [CURRENT_PATIENT]);


    useEffect(() => {
        fetchPatientShifts();
    }, [fetchPatientShifts]);


    const handleShiftCreationSuccess = () => {
        fetchPatientShifts(); 
    };

    const handleCancelShift = (id) => {
        const shift = patientSchedule.find(s => s.shiftId === id);

        if (shift && (shift.status.name === "Atendido" || shift.status.name === "Cancelado")) {
            toast.warning(`Este turno ya ha sido ${shift.status.name.toLowerCase()} y no se puede modificar.`);
            return;
        }
        setShiftToCancel(id);
        setIsCancelModalOpen(true);
    };

    const confirmCancel = async () => {
        setLoadingCancel(true);

        try {
            console.log(shiftToCancel)
            const data = await cancelShiftById(shiftToCancel)

            toast.success("Turno cancelado exitosamente.");
            await fetchPatientShifts(); 

        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || "Ocurrió un error al intentar cancelar el turno.";
            toast.error(errorMessage);
            
        } finally {
            setLoadingCancel(false);
            setIsCancelModalOpen(false);
            setShiftToCancel(null);
        }
    };

    const closeCancelModal = () => {
        if (!loadingCancel) {
            setIsCancelModalOpen(false);
            setShiftToCancel(null);
        }
    };

    return (
        <AnimatedPage>
            <div className="px-8">
                <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
                    Mis Próximos Turnos
                </h1>

                <SectionCard content={                    
                    isLoadingShifts ? (
                        <div className="flex justify-center items-center py-10 min-h-[150px]">
                             <Spinner />
                        </div>
                    ) : (
                        <ShiftList
                            shifts={patientSchedule}
                            type={user.role}
                            onCancel={handleCancelShift}
                        />
                    )
                } />
                
                <SectionCard tittle={"Solicitar Nuevo Turno"} content={
                    <NewMedicalShift user={user} onShiftCreated={handleShiftCreationSuccess} />
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
                                <Button 
                                    text="Volver" 
                                    variant="secondary" 
                                    onClick={closeCancelModal} 
                                    disable={loadingCancel} 
                                />
                                <Button 
                                    text="Confirmar" 
                                    variant="primary" 
                                    onClick={confirmCancel} 
                                    isLoading={loadingCancel} 
                                />
                            </div>
                        </div>
                    }
                />
            </Modal>
        </AnimatedPage>
    );
}

export default PatientHome;