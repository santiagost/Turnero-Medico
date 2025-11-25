import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addDays, format } from "date-fns";
import { useToast } from "../../../hooks/useToast";

import Calendar from "../../ui/Calendar";
import WeeklySlots from "./WeeklySlots";
import Select from "../../ui/Select";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import PrincipalCard from "../../ui/PrincipalCard";

import {
    doctorOptions,
    mockDoctors,
    getMockDoctorSchedule,
    mockDoctorAvailability
} from "../../../utils/mockData";

import { newShiftSchema } from "../../../validations/shiftSchemas";

import { getSpecialtyOptions } from "../../../../services/specialty.service";

const sectionVariants = {
    hidden: {
        opacity: 0,
        height: 0,
        y: -20,
        transition: { duration: 0.3, ease: "easeInOut" },
    },
    visible: {
        opacity: 1,
        height: "auto",
        y: 0,
        transition: { duration: 0.2, ease: "easeInOut", delay: 0.1 },
    },
    exit: {
        opacity: 0,
        height: 0,
        y: -20,
        transition: { duration: 0.2 },
    },
};

const NewMedicalShift = ({ onShiftCreated }) => {
    const [formData, setFormData] = useState({
        specialty: "",
        doctor: "",
        date: "",
        time: "",
        reason: "",
    });

    const toast = useToast();

    const [errors, setErrors] = useState({});
    const [doctorScheduleConfig, setDoctorScheduleConfig] = useState([]);

    
    const [filteredDoctorOptions, setFilteredDoctorOptions] = useState(doctorOptions);
    const [selectedWeek, setSelectedWeek] = useState();
    const [selectedShift, setSelectedShift] = useState();
    const [currentWeekShifts, setCurrentWeekShifts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const isReasonValid = formData.reason && formData.reason.replace(/\s/g, "").length >= 5 && !errors.reason;

    
    const doctorOptionsWithAll = [{ value: "", label: "" }, ...filteredDoctorOptions];

    const [specialtyOptionsWithEmpty, setSpecialtyOptions] = useState([
                { value: "", label: "" }
            ]);
        
            useEffect(() => {
                const fetchOptions = async () => {
                    try {
                        const dataFromBackend = await getSpecialtyOptions();
                        
                        setSpecialtyOptions([
                            { value: "", label: "" },
                            ...dataFromBackend
                        ]);
                    } catch (error) {
                        console.error("No se pudieron cargar las opciones", error);
                    }
                };
        
                fetchOptions();
            }, []);
    
    const selectedDoctorObj = mockDoctors.find(
        (doc) => doc.doctorId === parseInt(formData.doctor)
    );

    const getSpecialtyName = () => {
        const found = specialtyOptionsWithEmpty.find(s => s.value === parseInt(formData.specialty));
        return found ? found.label : "";
    };

    useEffect(() => {
        if (formData.specialty === "") {
            setFilteredDoctorOptions(doctorOptions);
        } else {
            const filteredDocs = mockDoctors.filter(
                (doc) => doc.specialty.specialtyId === parseInt(formData.specialty)
            );
            const newOptions = filteredDocs.map((doc) => ({
                value: doc.doctorId,
                label: `Dr/a. ${doc.firstName} ${doc.lastName}`,
            }));
            setFilteredDoctorOptions(newOptions);
        }
    }, [formData.specialty]);

    useEffect(() => {
        if (selectedWeek?.from) {
            const mocks = getMockDoctorSchedule(addDays(selectedWeek.from, 1));
            setCurrentWeekShifts(mocks);
        }
    }, [selectedWeek, formData.doctor]);

    useEffect(() => {
        if (selectedShift && selectedShift.date) {
            setFormData((prev) => ({
                ...prev,
                date: format(selectedShift.date, "yyyy-MM-dd"),
                time: selectedShift.time,
            }));
            setErrors((prev) => ({ ...prev, date: null, time: null }));
        } else {
            setFormData((prev) => ({
                ...prev,
                date: "",
                time: "",
            }));
        }
    }, [selectedShift]);

    useEffect(() => {
        if (formData.doctor) {
            // AQUI VA LA LLAMADA AL BACKEND
            // api.get(`/doctors/${formData.doctor}/availability`)

            // Por ahora, usaremos el mock. Puedes filtrar si el mock tiene ID de doctor, 
            // o usar uno genérico para probar que funciona la UI.
            setDoctorScheduleConfig(mockDoctorAvailability);
        } else {
            setDoctorScheduleConfig([]);
        }
    }, [formData.doctor]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "doctor") {
            setSelectedShift(null);
            if (value !== "") {
                const selectedDoctor = mockDoctors.find(
                    (doc) => doc.doctorId === parseInt(value)
                );
                if (selectedDoctor) {
                    setFormData((prev) => ({
                        ...prev,
                        doctor: value,
                        specialty: selectedDoctor.specialty.specialtyId,
                    }));
                    if (errors.specialty) {
                        setErrors((prev) => ({ ...prev, specialty: null }));
                    }
                }
            } else {
                setFormData((prev) => ({ ...prev, doctor: "" }));
            }
        } else if (name === "specialty") {
            setSelectedShift(null);
            setFormData((prev) => ({
                ...prev,
                specialty: value,
                doctor: "",
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }

        if (errors[name]) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [name]: null,
            }));
        }
    };

    const validateStep1 = () => {
        const step1Fields = ["specialty", "doctor", "date", "time"];
        const newErrors = {};
        let isValid = true;

        step1Fields.forEach((field) => {
            const rule = newShiftSchema[field];
            if (rule) {
                const error = rule(formData[field], formData);
                if (error) {
                    newErrors[field] = error;
                    isValid = false;
                }
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleOpenConfirmation = (e) => {
        e.preventDefault();
        if (validateStep1()) {
            setIsConfirmModalOpen(true);
        } else {
            toast.warning("Por favor, complete correctamente todos los campos.");
            console.log("Errores en el formulario:", errors);
        }
    };

    const handleConfirmShift = async () => {
        const reasonRule = newShiftSchema.reason;
        const reasonError = reasonRule ? reasonRule(formData.reason, formData) : null;

        if (reasonError) {
            setErrors((prev) => ({ ...prev, reason: reasonError }));
            toast.error("El motivo de consulta es obligatorio.");
            return;
        }

        setIsLoading(true); // Activar spinner

        try {
            // AQUI VA LA LLAMADA AL BACKEND
            // await axios.post('/api/shifts', formData);
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simulación de error (Descomentar para probar)
            // await new Promise((_, reject) => setTimeout(() => reject(new Error("Cupo no disponible")), 2000));

            // Éxito
            toast.success("Turno reservado con éxito. Revise su agenda.");
            if (onShiftCreated) {
            onShiftCreated(); 
        }

            // Limpiar formulario y cerrar modal
            setFormData({
                specialty: "",
                doctor: "",
                date: "",
                time: "",
                reason: "",
            });
            setSelectedWeek();
            setSelectedShift();
            setIsConfirmModalOpen(false);
            setErrors({});

        } catch (error) {
            console.error("Error al confirmar turno:", error);
            const errorMessage = error.response?.data?.message || "Ocurrió un error al reservar el turno. Intente nuevamente.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false); // Desactivar spinner
        }
    };

    const closeConfirmModal = () => {
        if (!isLoading) { // Bloquear cierre si está cargando
            setIsConfirmModalOpen(false);
            setFormData((prev) => ({ ...prev, reason: "" }));
            setErrors((prev) => ({ ...prev, reason: null }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const rule = newShiftSchema[name];
        if (rule) {
            const error = rule(value, formData);
            setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
        }
    };

    return (
        <div className="my-4 mx-2">
            <form
                className="grid grid-cols-5 items-start m-2 gap-4 bg-transparent w-full"
                onSubmit={handleOpenConfirmation}
                noValidate
            >
                <Select
                    tittle="Especialidad"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleChange}
                    options={specialtyOptionsWithEmpty}
                    onBlur={handleBlur}
                    error={errors.specialty}
                />
                <Select
                    tittle="Médico"
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleChange}
                    options={doctorOptionsWithAll}
                    onBlur={handleBlur}
                    error={errors.doctor}
                />
                <Input
                    tittle="Fecha"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    disable={true}
                    onBlur={handleBlur}
                    error={errors.date}
                />
                <Input
                    tittle="Horario"
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    disable={true}
                    onBlur={handleBlur}
                    error={errors.time}
                />
                <div className='flex flex-row items-center justify-center h-full gap-5 text-white'>
                    <Button
                        text={"Confirmar"}
                        variant={"primary"}
                        type={"submit"}
                        size={"big"}
                    />
                </div>
            </form>

            <AnimatePresence>
                {selectedDoctorObj && (
                    <motion.div
                        className="grid grid-cols-4 m-4 gap-4"
                        key="doctor-availability-section"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={{ overflow: "hidden" }}
                    >
                        <div className="col-span-1 items-center justify-start pt-10 flex flex-col">
                            <div className="mb-4 text-start">
                                <p className="text-custom-gray text-sm">Disponibilidad de:</p>
                                <p className="text-xl font-bold text-custom-blue">
                                    Dr/a. {selectedDoctorObj.firstName}{" "}
                                    {selectedDoctorObj.lastName}
                                </p>
                                <p className="text-sm mt-2">
                                    Por favor, seleccione una semana para ver los turnos
                                    disponibles
                                </p>
                            </div>
                            <Calendar
                                selectedWeek={selectedWeek}
                                setSelectedWeek={setSelectedWeek}
                            />
                        </div>

                        <div className="bg-white col-span-3 items-center justify-center flex rounded-xl h-[65vh]">
                            <WeeklySlots
                                selectedWeek={selectedWeek}
                                selectedShift={selectedShift}
                                setSelectedShift={setSelectedShift}
                                existingShifts={currentWeekShifts}
                                doctorAvailability={doctorScheduleConfig}
                                role="patient"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* --- MODAL DE CONFIRMACIÓN --- */}
            <Modal isOpen={isConfirmModalOpen} onClose={closeConfirmModal}>
                <PrincipalCard
                    title="Confirmar Nuevo Turno"
                    content={
                        <div className="flex flex-col items-center gap-5 p-4 w-full min-w-lg">

                            {/* Resumen del turno */}
                            <div className="bg-gray-50 p-4 rounded-lg w-full border border-gray-200">
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold text-gray-600">Especialidad:</span>
                                    <span className="text-custom-dark-blue">{getSpecialtyName()}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold text-gray-600">Médico:</span>
                                    <span className="text-custom-dark-blue">
                                        {selectedDoctorObj ? `Dr/a. ${selectedDoctorObj.firstName} ${selectedDoctorObj.lastName}` : '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold text-gray-600">Fecha:</span>
                                    <span className="text-custom-dark-blue">{formData.date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Hora:</span>
                                    <span className="text-custom-dark-blue font-bold">{formData.time} hs</span>
                                </div>
                            </div>

                            <p className="text-center font-semibold text-md text-custom-dark-blue">
                                Es importante que complete esta información
                            </p>

                            <Input
                                tittle={"Motivo de Consulta"}
                                name="reason"
                                multiline={true}
                                rows={4}
                                value={formData.reason}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.reason}
                            />

                            <p className="text-center text-sm text-custom-gray">
                                ¿Estás seguro de que deseas reservar este turno?
                            </p>

                            <div className="flex flex-row gap-6 w-full justify-center">
                                <Button
                                    text="Volver"
                                    variant="secondary"
                                    onClick={closeConfirmModal}
                                    className="w-full"
                                    disable={isLoading}
                                />
                                <Button
                                    text="Confirmar Turno"
                                    variant="primary"
                                    onClick={handleConfirmShift}
                                    className="w-full"
                                    disable={!isReasonValid}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>
                    }
                />
            </Modal>
        </div>
    );
};

export default NewMedicalShift;