import React, { useState, useMemo } from "react";
import { IoIosAdd, IoIosClose, IoIosCheckmark } from "react-icons/io";

import { useToast } from "../../../hooks/useToast";

// Utilities
import { medicationValidationSchema } from "../../../validations/adminSchemas";
import { calculateAge, estimateDate, getFormattedDate, getFormattedTime } from "../../../utils/dateUtils";
import { completedConsultationsMock } from "../../../utils/mockData";
// Features
import MedicationList from "../medication/MedicationList";
import ConsultationCard from "../medicalHistory/ConsultationCard";
// UI
import IconButton from "../../ui/IconButton";
import Button from "../../ui/Button";
import Input from "../../ui/Input"

const ShiftAttention = ({ shift, onSave, onDiscard }) => {
    const toast = useToast();

    // ----- Estado Principal ----
    const [formData, setFormData] = useState({
        diagnosis: "",
        treatment: "",
        personalNotes: "",
        medications: [],
    });
    const displayDate = getFormattedDate(shift.startTime);
    const displayTime = getFormattedTime(shift.startTime);

    const [allComplete, setAllComplete] = useState(false);

    // ----- Subformulario de Medicamentos ----
    const [medicationForm, setMedicationForm] = useState(null);
    const [medicationErrors, setMedicationErrors] = useState({});
    const [showAddMedicationForm, setShowAddMedicationForm] = useState(false);

    // -----------------------------------------------------------------------
    // 2. FILTRAR CONSULTAS DEL PACIENTE
    // -----------------------------------------------------------------------
    const patientHistory = useMemo(() => {
        if (!shift?.patient?.patientId) return [];
        const allHistory = completedConsultationsMock.filter(consultation =>
            consultation.shift?.patient?.patientId === shift.patient.patientId
        );
        allHistory.sort((a, b) => new Date(b.consultationDate) - new Date(a.consultationDate));
        return allHistory.slice(0, 3);

    }, [shift]);


    // --- Lógica del Formulario Principal (Consulta) ---
    const updateFormData = (e) => {
        const { name, value } = e.target;
        const nextFormData = {
            ...formData,
            [name]: value
        };
        setFormData(nextFormData);
        const isDiagnosisFilled = nextFormData.diagnosis.trim() !== "";
        const isTreatmentFilled = nextFormData.treatment.trim() !== "";
        const isNotesFilled = nextFormData.personalNotes.trim() !== "";

        if (isDiagnosisFilled && isTreatmentFilled && isNotesFilled) {
            setAllComplete(true);
        } else {
            setAllComplete(false);
        }
    };

    // ... (El resto de la lógica de medicamentos se mantiene igual) ...
    const updateMedicationForm = (e) => {
        const { name, value } = e.target;
        setMedicationForm(prev => ({
            ...prev,
            [name]: value
        }));
        if (medicationErrors[name]) {
            setMedicationErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const handleMedicationBlur = (e) => {
        const { name, value } = e.target;
        const rule = medicationValidationSchema[name];
        if (rule) {
            const error = rule(value, medicationForm);
            setMedicationErrors(prevErrors => ({ ...prevErrors, [name]: error }));
        }
    };

    const validateMedicationForm = () => {
        const newErrors = {};
        for (const name in medicationValidationSchema) {
            const value = medicationForm[name];
            const rule = medicationValidationSchema[name];
            const error = rule(value, medicationForm);
            if (error) {
                newErrors[name] = error;
            }
        }
        setMedicationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleDeleteMedication = (indexToDelete) => {
        setFormData(prev => ({
            ...prev,
            medications: prev.medications.filter((_, index) => index !== indexToDelete)
        }));
        toast.info("Medicamento eliminado de la lista.");
    }

    const handleAddMedication = () => {
        setMedicationForm({
            name: "",
            dosage: "",
            instructions: ""
        });
        setShowAddMedicationForm(true);
        setMedicationErrors({});
    }

    const handleDiscardMedication = () => {
        setShowAddMedicationForm(false);
        setMedicationForm(null);
        setMedicationErrors({});
    }

    const handleConfirmMedication = () => {
        const isValid = validateMedicationForm();
        if (!isValid) {
            toast.warning("Por favor, complete correctamente todos los campos del medicamento.");
            return;
        }
        setFormData(prev => ({
            ...prev,
            medications: [
                ...prev.medications,
                medicationForm
            ]
        }));
        toast.success("Medicamento agregado a la lista.");
        setShowAddMedicationForm(false);
        setMedicationForm(null);
        setMedicationErrors({});
    }


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!allComplete) {
            toast.error("Por favor, complete el diagnóstico, tratamiento y las notas personales.");
            return;
        }
        onSave(formData);
    };

    const handleDiscard = () => {
        onDiscard();
    }

    return (
        <form
            className="rounded-xl bg-white p-2 m-4 flex flex-col items-center justify-start gap-4 h-full w-full text-custom-dark-blue"
            onSubmit={handleSubmit}>

            {/* Datos del Paciente */}
            <div className="w-full px-5 py-2">
                <div className="flex flex-row items-center justify-between">
                    <p className="font-bold text-xl">{shift?.patient?.lastName}, {shift?.patient?.firstName}</p>
                    <p className="font-semibold">Fecha: <span className="font-normal">{estimateDate(displayDate)} - {displayTime}</span></p>
                </div>
                <div className="mx-2 my-1">
                    <p className="font-semibold">Motivo de Consulta: <span className="font-normal">{shift?.reason}</span></p>
                    <div className="flex flex-row items-center justify-between">
                        <p className="font-semibold">Edad: <span className="font-normal">{calculateAge(shift?.patient?.birthDate)} años</span></p>
                        <p className="font-semibold">DNI: <span className="font-normal">{shift?.patient?.dni}</span></p>
                        <p className="font-semibold">Teléfono: <span className="font-normal">{shift?.patient?.telephone}</span></p>
                        <p className="font-semibold">Obra Social: <span className="font-normal">{shift?.patient?.socialWork?.name || "No Aplica"}</span></p>
                        <p className="font-semibold">Número de Afiliado: <span className="font-normal">{shift?.patient?.membershipNumber || "No Aplica"}</span></p>
                    </div>
                </div>
            </div>

            {/* 3. Sección de Historial (USANDO LA LISTA FILTRADA) */}
            <div className="w-full px-5 py-2">
                <p className="font-bold text-xl text-start">Últimas Consultas</p>
                <div className="mx-2 my-1">
                    {patientHistory.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm py-4">El paciente no tiene consultas previas.</p>
                    ) : (
                        patientHistory.map(consultation => (
                            <ConsultationCard
                                key={consultation.consultationId}
                                consultation={consultation}
                                type="Doctor"
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Formulario de Diagnóstico */}
            <div className="w-full px-5 py-2">
                <p className="font-bold text-xl text-start">Datos de la Consulta</p>
                <div className="flex flex-row gap-4 mx-2 my-1">
                    <div className="w-1/2 flex flex-col gap-2">
                        <Input
                            tittle={"Diagnostico"}
                            name="diagnosis"
                            multiline={true}
                            rows={2}
                            value={formData.diagnosis}
                            onChange={updateFormData}
                        />
                        <Input
                            tittle={"Tratamiento"}
                            name="treatment"
                            multiline={true}
                            rows={4}
                            value={formData.treatment}
                            onChange={updateFormData}
                        />
                    </div>
                    <div className="w-1/2">
                        <Input
                            tittle={"Notas Personales del Médico"}
                            name="personalNotes"
                            multiline={true}
                            rows={8}
                            value={formData.personalNotes}
                            onChange={updateFormData}
                        />
                    </div>
                </div>
            </div>

            {/* Sección de Medicamentos */}
            <div className="w-full px-5 py-2">
                <p className="font-bold text-xl text-start">Recetar Medicamento</p>
                <div className="flex flex-row gap-4 w-full py-1">
                    <MedicationList
                        medications={formData.medications}
                        onDelete={handleDeleteMedication}
                    />
                    <IconButton icon={<IoIosAdd size={30} onClick={handleAddMedication} type={"button"} />} />
                </div>

                {showAddMedicationForm &&
                    <div className="flex flex-row items-center gap-10 m-2">
                        <div className="flex flex-row gap-4 w-3/4">
                            <Input tittle={"Medicamento"} name="name" value={medicationForm.name} onChange={updateMedicationForm} onBlur={handleMedicationBlur} error={medicationErrors.name} />
                            <Input tittle={"Dosis"} name="dosage" value={medicationForm.dosage} onChange={updateMedicationForm} onBlur={handleMedicationBlur} error={medicationErrors.dosage} />
                            <Input tittle={"Instrucciones"} name="instructions" value={medicationForm.instructions} onChange={updateMedicationForm} onBlur={handleMedicationBlur} error={medicationErrors.instructions} />
                        </div>

                        <div className="flex flex-row gap-4">
                            <IconButton icon={<IoIosCheckmark size={30} onClick={handleConfirmMedication} type={"button"} />} />
                            <IconButton icon={<IoIosClose size={30} onClick={handleDiscardMedication} type={"button"} />} />
                        </div>
                    </div>
                }
            </div>
            <div className="flex flex-row gap-20 m-2">
                <Button text={"Descartar Cambios"} type={"button"} variant={"secondary"} size={"medium"} onClick={handleDiscard} />
                <Button text={"Registrar Consulta"} type={"submit"} variant={"primary"} disable={!allComplete} size={"medium"} />
            </div>
        </form>
    );
};

export default ShiftAttention;