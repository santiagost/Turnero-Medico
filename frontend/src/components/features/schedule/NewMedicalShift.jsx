import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addDays, format, addMinutes } from "date-fns";
import { useToast } from "../../../hooks/useToast";

import Calendar from "../../ui/Calendar";
import WeeklySlots from "./WeeklySlots";
import Select from "../../ui/Select";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import PrincipalCard from "../../ui/PrincipalCard";
import { useAuth } from "../../../hooks/useAuth"

import { newShiftSchema } from "../../../validations/shiftSchemas";

import { getDoctorAgenda, createShift } from "../../../../services/shift.service";
import { getSpecialtyOptions } from "../../../../services/specialty.service";
import {
    getDoctorById,
    getDoctorOptions,
    getAllDoctorsWithFilters,
} from "../../../../services/doctor.service";

import { getAvailabilitiesByDoctor } from "../../../../services/availability.service";



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
    const { profile } = useAuth();
    const CURREND_PATIENT_ID = profile?.patientId;

    const [formData, setFormData] = useState({
        // Cambiados a specialtyId y doctorId
        specialtyId: "",
        doctorId: "",
        date: "",
        time: "",
        reason: "",
    });

    const toast = useToast();

    const [errors, setErrors] = useState({});
    const [doctorScheduleConfig, setDoctorScheduleConfig] = useState([]);

    // --- ESTADOS DE DATOS DE LA API ---
    const [allDoctorOptions, setAllDoctorOptions] = useState([]); // Todos los médicos de la API
    const [filteredDoctorOptions, setFilteredDoctorOptions] = useState([]); // Médicos filtrados/mostrados
    const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(null); // Detalles completos del doctor (para info y horarios)

    // --- ESTADOS DE UI/AGENDA ---
    const [selectedWeek, setSelectedWeek] = useState();
    const [selectedShift, setSelectedShift] = useState();
    const [currentWeekShifts, setCurrentWeekShifts] = useState([]); // Turnos ocupados reales
    const [isLoading, setIsLoading] = useState(false);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const isReasonValid = formData.reason && formData.reason.replace(/\s/g, "").length >= 5 && !errors.reason;

    // Opciones para el Select de Médicos
    const doctorOptionsWithAll = [{ value: "", label: "Seleccione Médico..." }, ...filteredDoctorOptions];

    // Opciones para el Select de Especialidades
    const [specialtyOptionsWithEmpty, setSpecialtyOptions] = useState([
        { value: "", label: "" }
    ]);

    // Objeto del doctor seleccionado (para el modal)
    const selectedDoctorObj = selectedDoctorDetails;

    // Función para obtener el nombre de la especialidad (para el modal)
    const getSpecialtyName = () => {
        const found = specialtyOptionsWithEmpty.find(s => String(s.value) === String(formData.specialtyId));
        return found ? found.label : "";
    };

    // Función para calcular la hora de fin del turno (+30 minutos)
    const calculateEndTime = (date, time) => {
        if (!date || !time) return null;

        // 1. Crear el objeto Date de la hora de inicio (YYYY-MM-DDT$HH:mm:ss)
        const startTimeStr = `${date}T${time}:00`;
        const startDate = new Date(startTimeStr);

        // 2. Sumar 30 minutos
        const endDate = addMinutes(startDate, 30);

        // 3. Formatear como "YYYY-MM-DD HH:MM:SS" para el backend
        // Asegúrate de que el backend interpreta esto correctamente como hora local
        return format(endDate, "yyyy-MM-dd HH:mm:ss");
    };

    // =================================================================================
    // --- EFECTO 1: CARGA INICIAL DE OPCIONES ---
    // =================================================================================
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const specialtyData = await getSpecialtyOptions();
                const doctorData = await getDoctorOptions(); // API: Cargar todos los médicos

                setSpecialtyOptions([
                    { value: "", label: "Seleccione Especialidad..." },
                    ...specialtyData
                ]);

                // Almacenar todos los médicos y mostrarlos inicialmente
                setAllDoctorOptions(doctorData);
                setFilteredDoctorOptions(doctorData);
            } catch (error) {
                console.error("No se pudieron cargar las opciones", error);
                toast.error("Error cargando listas de opciones");
            }
        };

        fetchOptions();
    }, []);

    // =================================================================================
    // --- EFECTO 2: FILTRAR MÉDICOS POR ESPECIALIDAD ---
    // Se ejecuta al cambiar formData.specialtyId
    // =================================================================================
    useEffect(() => {
        const filterDoctors = async () => {
            if (!formData.specialtyId) {
                // Si no hay especialidad, muestra todos los médicos
                setFilteredDoctorOptions(allDoctorOptions);
                return;
            }

            setIsLoading(true);
            try {
                // API: Filtrar médicos por el ID de especialidad
                const doctorsList = await getAllDoctorsWithFilters({
                    specialtyId: formData.specialtyId,
                });

                const mappedOptions = doctorsList.map((doc) => ({
                    value: doc.doctorId,
                    label: `Dr/a. ${doc.lastName}, ${doc.firstName}`,
                }));
                setFilteredDoctorOptions(mappedOptions);
            } catch (error) {
                console.error("Error filtrando médicos:", error);
                setFilteredDoctorOptions([]);
            } finally {
                setIsLoading(false);
            }
        };

        filterDoctors();
    }, [formData.specialtyId, allDoctorOptions]);


    // =================================================================================
    // --- EFECTO 3: OBTENER DETALLES Y CONFIGURACIÓN DEL DOCTOR SELECCIONADO ---
    // Se ejecuta al cambiar formData.doctorId
    // =================================================================================
    useEffect(() => {
        if (!formData.doctorId) {
            setSelectedDoctorDetails(null);
            setDoctorScheduleConfig([]);
            return;
        }

        const fetchFullDoctorDetails = async () => {
            try {
                // API: Obtener detalles completos, incluyendo configuración de horario
                const data = await getDoctorById(formData.doctorId);
                setSelectedDoctorDetails(data);

                if (data?.specialty && !formData.specialtyId) {
                    setFormData((prev) => ({
                        ...prev,
                        specialtyId: data.specialty.specialtyId,
                    }));
                }

                const scheduleData = await getAvailabilitiesByDoctor(formData.doctorId);
                setDoctorScheduleConfig(scheduleData);

            } catch (error) {
                console.error("Error buscando detalles del doctor", error);
                setSelectedDoctorDetails(null);
                setDoctorScheduleConfig([]);
                toast.error("Error al cargar la disponibilidad del médico.");
            }
        };

        fetchFullDoctorDetails();
    }, [formData.doctorId]);


    // =================================================================================
    // --- EFECTO 4: CARGAR TURNOS OCUPADOS (currentWeekShifts) ---
    // Se ejecuta al cambiar la semana o el doctor
    // =================================================================================
    useEffect(() => {
        const startDate = selectedWeek?.from;
        const endDate = selectedWeek?.to;
        const doctorId = formData.doctorId;

        if (startDate && endDate && doctorId) {
            const formattedStartDate = format(startDate, 'yyyy-MM-dd');
            const formattedEndDate = format(endDate, 'yyyy-MM-dd');

            const fetchDoctorAgenda = async () => {
                try {
                    const occupiedShifts = await getDoctorAgenda(
                        1,
                        formattedStartDate,
                        formattedEndDate
                    );

                    setCurrentWeekShifts(occupiedShifts);

                } catch (error) {
                    console.error("Error al cargar turnos ocupados:", error);
                    toast.error("Error al cargar la agenda de turnos.");
                    setCurrentWeekShifts([]);
                }
            };

            fetchDoctorAgenda();
        } else {
            setCurrentWeekShifts([]);
        }
    }, [selectedWeek, formData.doctorId]);


    // =================================================================================
    // --- EFECTO 5: SINCRONIZAR TURNO SELECCIONADO (Slot) con el Formulario ---
    // =================================================================================
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


    // =================================================================================
    // --- MANEJADORES DE ESTADO ---
    // =================================================================================
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "doctorId") {
            // Si cambia el doctor, limpia el turno seleccionado
            setSelectedShift(null);
            setFormData((prev) => ({ ...prev, doctorId: value }));

        } else if (name === "specialtyId") {
            // Si cambia la especialidad, limpia doctor, turno y detalles
            setSelectedShift(null);
            setSelectedDoctorDetails(null);
            setFormData((prev) => ({
                ...prev,
                specialtyId: value,
                doctorId: "", // Limpiar el doctor
            }));

        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }

        // Limpiar errores al cambiar el campo
        if (errors[name]) {
            setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        // La validación debe usar los nombres de campo correctos (specialtyId, doctorId, etc.)
        const rule = newShiftSchema[name];
        if (rule) {
            const error = rule(value, formData);
            setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
        }
    };

    const validateStep1 = () => {
        // Validación basada en los campos reales del estado
        const step1Fields = ["specialtyId", "doctorId", "date", "time"];
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

    const closeConfirmModal = () => {
        if (!isLoading) { // Bloquear cierre si está cargando
            setIsConfirmModalOpen(false);
            setFormData((prev) => ({ ...prev, reason: "" }));
            setErrors((prev) => ({ ...prev, reason: null }));
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

        const patientId = CURREND_PATIENT_ID;
        const startTimeFormatted = `${formData.date} ${formData.time}:00`;
        const endTimeFormatted = calculateEndTime(formData.date, formData.time);

        if (!patientId || !endTimeFormatted) {
            toast.error("Error de datos: Falta ID de paciente o la hora de finalización del turno.");
            return;
        }
        // ------------------------------------

        setIsLoading(true); // Activar spinner

        try {
            const shiftPayload = {
                patientId: patientId,
                doctorId: formData.doctorId,
                startTime: startTimeFormatted,
                endTime: endTimeFormatted,
                reason: formData.reason,
            };

            console.log("Payload para crear turno:", shiftPayload);
            const newShift = await createShift(shiftPayload);

            toast.success(`Turno reservado con éxito. Lo esperamos...`);
            if (onShiftCreated) {
                onShiftCreated();
            }

            setFormData({
                specialtyId: "",
                doctorId: "",
                date: "",
                time: "",
                reason: "",
            });
            setSelectedWeek(undefined);
            setSelectedShift(null);
            setSelectedDoctorDetails(null);
            setIsConfirmModalOpen(false);
            setErrors({});

        } catch (error) {
            console.error("Error al confirmar turno:", error.response?.data || error);
            toast.error("Ocurrió un error al reservar el turno. Intente nuevamente.");
        } finally {
            setIsLoading(false);
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
                    name="specialtyId"
                    value={formData.specialtyId}
                    onChange={handleChange}
                    options={specialtyOptionsWithEmpty}
                    onBlur={handleBlur}
                    error={errors.specialtyId}
                    disable={isLoading}
                />
                <Select
                    tittle="Médico"
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    options={doctorOptionsWithAll}
                    onBlur={handleBlur}
                    error={errors.doctorId}
                    disable={isLoading}
                />
                <Input
                    tittle="Fecha"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    disable={true} // Se selecciona del WeeklySlots/Calendar
                    onBlur={handleBlur}
                    error={errors.date}
                />
                <Input
                    tittle="Horario"
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    disable={true} // Se selecciona del WeeklySlots
                    onBlur={handleBlur}
                    error={errors.time}
                />
                <div className='flex flex-row items-center justify-center h-full gap-5 text-white'>
                    <Button
                        text={"Confirmar"}
                        variant={"primary"}
                        type={"submit"}
                        size={"big"}
                        isLoading={isLoading}
                    />
                </div>
            </form>

            <AnimatePresence>
                {selectedDoctorObj && (
                    <motion.div
                        className="grid grid-cols-5 2xl:grid-cols-4 m-4 gap-4"
                        key="doctor-availability-section"
                        variants={sectionVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={{ overflow: "hidden" }}
                    >
                        <div className="col-span-2 2xl:col-span-1 items-center justify-start pt-10 flex flex-col w-full">
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