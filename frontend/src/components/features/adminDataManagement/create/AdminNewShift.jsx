import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addMinutes } from "date-fns";
import { useToast } from "../../../../hooks/useToast";

// Componentes UI (asumo que se mantienen igual)
import Calendar from "../../../ui/Calendar";
import WeeklySlots from "../../schedule/WeeklySlots";
import Select from "../../../ui/Select";
import Input from "../../../ui/Input";
import Button from "../../../ui/Button";
import Modal from "../../../ui/Modal";
import PrincipalCard from "../../../ui/PrincipalCard";
import IconButton from "../../../ui/IconButton";
import ToggleSwitch from "../../../ui/ToggleSwitch";

// Iconos
import { FaSearch } from "react-icons/fa";
import { LiaUndoAltSolid } from "react-icons/lia";

// Servicios de API (adaptados para consistencia)
import { getSpecialtyOptions } from "../../../../../services/specialty.service";
import { getSocialWorkOptions } from "../../../../../services/socialWork.service";
import { getAllDoctorsWithFilters, getDoctorOptions, getDoctorById } from "../../../../../services/doctor.service";
import { getAvailabilitiesByDoctor } from "../../../../../services/availability.service";
// **Consumo de Endpoints Consistente**
import { getDoctorAgenda, createShift } from "../../../../../services/shift.service";
// Servicios de Paciente (adaptados o simulados)
import { getAllPatientsWithFilters, createPatient } from "../../../../../services/patient.service"; // Asumo un nuevo servicio


// Esquemas de validación
import { newAdminShiftSchema } from "../../../../validations/shiftSchemas";
import { adminCreatePatientSchema } from "../../../../validations/adminSchemas";


const sectionVariants = {
    hidden: { opacity: 0, height: 0, y: -20, transition: { duration: 0.3 } },
    visible: {
        opacity: 1,
        height: "auto",
        y: 0,
        transition: { duration: 0.2, delay: 0.1 },
    },
    exit: { opacity: 0, height: 0, y: -20, transition: { duration: 0.2 } },
};

const AdminNewShift = ({ onShiftCreated }) => { // Agregar onShiftCreated si se usa para refrescar
    const [isPatientManual, setIsPatientManual] = useState(false);
    const [isPatientFound, setIsPatientFound] = useState(false);
    // Nuevo estado para guardar el ID del paciente si fue encontrado
    const [existingPatientId, setExistingPatientId] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const toast = useToast();

    // Estructura de datos para paciente y turno
    const [formData, setFormData] = useState({
        patient: {
            dni: "",
            firstName: "",
            lastName: "",
            telephone: "",
            birthDate: "",
            email: "",
            membershipNumber: "",
            socialWorkId: "",
        },
        specialtyId: "",
        doctorId: "",
        date: "",
        time: "",
        reason: "",
    });

    const [errors, setErrors] = useState({});

    // --- ESTADOS PARA OPCIONES Y DATOS VISUALES ---
    const [allDoctorOptions, setAllDoctorOptions] = useState([]);
    const [filteredDoctorOptions, setFilteredDoctorOptions] = useState([]);
    const [specialtyOptions, setSpecialtyOptions] = useState([
        { value: "", label: "" },
    ]);
    const [socialWorkOptions, setSocialWorkOptions] = useState([
        { value: "", label: "" },
    ]);

    // Estado separado para guardar TODA la info del doctor seleccionado (para el calendario)
    const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(null);
    const [doctorScheduleConfig, setDoctorScheduleConfig] = useState([]);

    // Estados del Calendario
    const [selectedWeek, setSelectedWeek] = useState();
    const [selectedShift, setSelectedShift] = useState();
    const [currentWeekShifts, setCurrentWeekShifts] = useState([]);

    const doctorOptionsWithEmpty = [
        { value: "", label: "Seleccione Médico..." },
        ...filteredDoctorOptions,
    ];

    const getParticularId = () => {
        const particularOption = socialWorkOptions.find(opt => opt.label === "Particular");
        return particularOption ? particularOption.value : null;
    };


    const isParticularSelected = () => {
        const selectedId = formData.patient.socialWorkId;
        return selectedId && selectedId == getParticularId();
    };

    // Función para calcular la hora de fin del turno (+30 minutos) - Copiada del componente de Paciente
    const calculateEndTime = (date, time) => {
        if (!date || !time) return null;

        const startTimeStr = `${date}T${time}:00`;
        const startDate = new Date(startTimeStr);

        const endDate = addMinutes(startDate, 30);

        return format(endDate, "yyyy-MM-dd HH:mm:ss");
    };

    // --- CARGA INICIAL DE OPCIONES ---
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const specialtyData = await getSpecialtyOptions();
                const socialWorkData = await getSocialWorkOptions();
                const doctorData = await getDoctorOptions();

                setSpecialtyOptions([{ value: "", label: "Seleccione Especialidad..." }, ...specialtyData]);
                setSocialWorkOptions([{ value: "", label: "Seleccione Obra Social..." }, ...socialWorkData]);
                setAllDoctorOptions(doctorData);
                setFilteredDoctorOptions(doctorData);
            } catch (error) {
                console.error("Error cargando opciones", error);
                toast.error("Error cargando listas de opciones");
            }
        };
        fetchOptions();
    }, []);

    // --- EFECTO: OBTENER DETALLES Y CONFIGURACIÓN DEL DOCTOR SELECCIONADO ---
    useEffect(() => {
        if (!formData.doctorId) {
            setSelectedDoctorDetails(null);
            setDoctorScheduleConfig([]);
            return;
        }

        const fetchFullDoctorDetails = async () => {
            try {
                const data = await getDoctorById(formData.doctorId);
                setSelectedDoctorDetails(data);

                if (data?.specialty && !formData.specialtyId) {
                    setFormData((prev) => ({
                        ...prev,
                        specialtyId: data.specialty.specialtyId,
                    }));
                }

                // Usar el endpoint real si se tiene:
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

    // --- EFECTO: FILTRAR MEDICOS POR ESPECIALIDAD ---
    useEffect(() => {
        const filterDoctors = async () => {
            if (!formData.specialtyId) {
                setFilteredDoctorOptions(allDoctorOptions);
                return;
            }

            setIsLoading(true);
            try {
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

    // --- EFECTO: CARGAR TURNOS OCUPADOS (currentWeekShifts) ---
    // Mismo consumo que el componente de paciente
    useEffect(() => {
        const startDate = selectedWeek?.from;
        const endDate = selectedWeek?.to;
        const doctorId = formData.doctorId;

        if (startDate && endDate && doctorId) {
            const formattedStartDate = format(startDate, 'yyyy-MM-dd');
            const formattedEndDate = format(endDate, 'yyyy-MM-dd');

            const fetchDoctorAgenda = async () => {
                try {
                    // Endpoint: /api/shift/doctor/{doctorId}/agenda?startDate={date}&endDate={date}
                    const occupiedShifts = await getDoctorAgenda(
                        doctorId, // El ID del doctor debe ser el primer parámetro
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


    // --- EFECTO: SELECCIONAR UN TURNO (SLOT) ---
    useEffect(() => {
        if (selectedShift && selectedShift.date) {
            setFormData((prev) => ({
                ...prev,
                date: format(selectedShift.date, "yyyy-MM-dd"),
                time: selectedShift.time,
            }));
            setErrors((prev) => ({ ...prev, date: null, time: null }));
        } else {
            setFormData((prev) => ({ ...prev, date: "", time: "" }));
        }
    }, [selectedShift]);

    // =================================================================================
    // --- MANEJADORES DE ESTADO Y LÓGICA DE NEGOCIO ---
    // =================================================================================

    const handleChange = (e) => {
        const { name, value } = e.target;
        const patientFields = [
            "dni",
            "firstName",
            "lastName",
            "telephone",
            "birthDate",
            "email",
            "membershipNumber",
            "socialWorkId",
        ];

        if (patientFields.includes(name)) {
            // Lógica de Paciente
            setFormData((prev) => ({
                ...prev,
                patient: { ...prev.patient, [name]: value },
            }));
            // Si cambia el DNI, reseteamos el paciente encontrado
            if (name === "dni" && isPatientFound) {
                setIsPatientFound(false);
                setExistingPatientId(null);
            }
        } else if (name === "specialtyId") {
            // Si cambia la especialidad, reseteamos doctor y turno
            setSelectedShift(null);
            setFormData((prev) => ({ ...prev, specialtyId: value, doctorId: "" }));
        } else if (name === "doctorId") {
            // Si cambia el doctor, reseteamos el turno seleccionado
            setSelectedShift(null);
            setFormData((prev) => ({ ...prev, doctorId: value }));
        } else {
            // Otros campos (reason, date, time)
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        const particularId = getParticularId();

        // Obtener los dos schemas. Asumo que adminCreatePatientSchema es una función que se llama
        const patientSchema = adminCreatePatientSchema(particularId);
        // newAdminShiftSchema es el objeto de reglas

        let rule;
        let valueToValidate;

        // 1. Priorizar la validación del PACIENTE si el campo existe en el schema de paciente.
        if (patientSchema.hasOwnProperty(name)) {
            rule = patientSchema[name];
            // El valor a validar se toma del sub-objeto 'patient'
            valueToValidate = formData.patient[name];

            // 2. Si no es de paciente, buscar en los campos del TURNO/RAZÓN.
        } else if (newAdminShiftSchema.hasOwnProperty(name)) {
            rule = newAdminShiftSchema[name];
            // El valor a validar se toma directamente del objeto raíz 'formData'
            valueToValidate = formData[name];
        } else {
            // No hay regla para este campo (ej. un campo interno no validado)
            return;
        }

        if (rule) {
            // Se pasa el objeto 'formData' completo a la regla, ya que 
            // las reglas complejas de Obra Social/Afiliado lo necesitan para las condicionales.
            const error = rule(valueToValidate, formData);

            // Se guardan los errores en el estado global 'errors'
            setErrors((prev) => ({ ...prev, [name]: error }));
        }
    };

    // --- BUSQUEDA DE PACIENTE ---
    const handleSearchPatient = async () => {
        const dniToSearch = formData.patient.dni;
        if (!dniToSearch || String(dniToSearch).length < 7) {
            toast.warning("Ingrese un DNI válido (mínimo 7 dígitos).");
            return;
        }

        setIsLoading(true);
        try {
            const patientsList = await getAllPatientsWithFilters({
                dni: dniToSearch,
            });

            const foundPatient = patientsList.length > 0 ? patientsList[0] : null;


            if (foundPatient) {
                // Paciente encontrado: Autocompletar y deshabilitar edición
                const patientEmail = foundPatient?.user?.email || "";
                const socialWorkId = foundPatient?.socialWork?.socialWorkId || "";

                setFormData((prev) => ({
                    ...prev,
                    patient: {
                        ...prev.patient,
                        dni: foundPatient.dni,
                        firstName: foundPatient.firstName,
                        lastName: foundPatient.lastName,
                        telephone: foundPatient.telephone,
                        birthDate: foundPatient.birthDate,
                        email: patientEmail,
                        membershipNumber: foundPatient.membershipNumber || "",
                        socialWorkId: String(socialWorkId) || "",
                    },
                }));
                setExistingPatientId(foundPatient.patientId); // Guardar ID
                setIsPatientFound(true);
                setIsPatientManual(false); // Desactivar modo manual
                setErrors((prev) => ({ ...prev, dni: null }));
                toast.success("Paciente encontrado. Complete los detalles del turno.");
            } else {
                // Paciente NO encontrado: Activar modo manual
                setExistingPatientId(null);
                setIsPatientFound(false);
                toast.warning("Paciente no encontrado. Active el modo 'Paciente sin usuario' para cargarlo manualmente.");
            }
        } catch (error) {
            console.error("Error buscando paciente:", error);
            toast.error("Ocurrió un error en la búsqueda del paciente.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- TOGGLE MANUAL ---
    const handleToggleChange = () => {
        const newState = !isPatientManual;
        setIsPatientManual(newState);

        if (newState && !isPatientFound) {
            // Modo manual ON, limpiar datos si no había paciente encontrado
            setFormData((prev) => ({
                ...prev,
                patient: {
                    dni: prev.patient.dni, // Conservar el DNI
                    firstName: "",
                    lastName: "",
                    telephone: "",
                    birthDate: "",
                    email: "",
                    membershipNumber: "",
                    socialWorkId: "",
                },
            }));
            setExistingPatientId(null);
        } else if (!newState && !isPatientFound) {
            // Modo manual OFF, no hay paciente encontrado, limpiar todo el paciente
            setFormData((prev) => ({
                ...prev,
                patient: {
                    dni: "",
                    firstName: "",
                    lastName: "",
                    telephone: "",
                    birthDate: "",
                    email: "",
                    membershipNumber: "",
                    socialWorkId: "",
                },
            }));
            setExistingPatientId(null);
        }
    };

    const validateStep1 = () => {
        const particularId = getParticularId();
        const patientSchema = adminCreatePatientSchema(particularId);

        let isValid = true;
        const newErrors = {};

        // --- 1. VALIDACIÓN DE DATOS DEL PACIENTE ---
        // Recorrer todos los campos definidos en el schema de paciente
        Object.keys(patientSchema).forEach((field) => {
            const rule = patientSchema[field];
            // Los valores de paciente están en formData.patient
            const value = formData.patient[field];

            // Ejecutar la regla, pasando el formData completo.
            const error = rule(value, formData);

            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        // --- 2. VALIDACIÓN DE DATOS DEL TURNO Y MOTIVO ---
        // Usamos solo los campos de turno y motivo que no son de paciente
        const shiftFieldsToValidate = ["specialtyId", "doctorId", "date", "time"];

        shiftFieldsToValidate.forEach((field) => {
            const rule = newAdminShiftSchema[field];
            // Los valores de turno están en la raíz de formData
            const value = formData[field];

            if (rule) {
                const error = rule(value, formData);
                if (error) {
                    newErrors[field] = error;
                    isValid = false;
                }
            }
        });

        // --- 3. ACTUALIZAR ERRORES Y RETORNAR ---
        // Reemplazamos todos los errores (de paciente y turno)
        setErrors(newErrors);

        // Aquí podrías agregar la lógica de estado (ej: si el paciente fue buscado o se está cargando manualmente)
        if (!existingPatientId && !isPatientManual) {
            toast.error("Debe buscar un paciente o activar el modo de carga manual.");
            return false;
        }

        return isValid;
    };


    const handleOpenConfirmation = (e) => {
        e.preventDefault();
        if (validateStep1()) {
            setIsConfirmModalOpen(true);
        } else {
            toast.warning("Por favor, complete correctamente todos los campos obligatorios del paciente y del turno.");
        }
    };

    const handleConfirmShift = async () => {
        // 1. Validar el motivo de consulta (Reason)
        const reasonRule = newAdminShiftSchema.reason;
        const reasonError = reasonRule ? reasonRule(formData.reason, formData) : null;

        if (reasonError) {
            setErrors((prev) => ({ ...prev, reason: reasonError }));
            toast.error("El motivo de consulta es obligatorio.");
            return;
        }

        const startTimeFormatted = `${formData.date} ${formData.time}:00`;
        const endTimeFormatted = calculateEndTime(formData.date, formData.time);

        // --- Preparación de datos de turno comunes ---
        const baseShiftPayload = {
            doctorId: formData.doctorId,
            startTime: startTimeFormatted,
            endTime: endTimeFormatted,
            reason: formData.reason,
        };

        setIsLoading(true);

        try {
            let finalPatientId = existingPatientId;

            // ==========================================================
            // SCENARIO 1: Paciente NUEVO (isPatientManual = true)
            // ==========================================================
            if (isPatientManual) {

                // 1.1. Preparar Payload para crear el Paciente
                const patientCreationPayload = {
                    dni: formData.patient.dni,
                    firstName: formData.patient.firstName,
                    lastName: formData.patient.lastName,
                    telephone: formData.patient.telephone,
                    email: formData.patient.email,
                    birthDate: formData.patient.birthDate,
                    socialWorkId: formData.patient.socialWorkId,
                    membershipNumber: formData.patient.membershipNumber,
                    // NOTA: Si el backend espera 'password', deberías simular una o pedirla.
                    // Por simplicidad, asumimos que createPatient maneja la contraseña.
                };

                console.log("Payload para crear paciente:", patientCreationPayload);

                // 1.2. API CALL: Crear el Paciente
                // Endpoint: POST /pacientes/
                const newPatient = await createPatient(patientCreationPayload, socialWorkOptions);

                if (!newPatient || !newPatient.patientId) {
                    throw new Error("La creación del paciente falló o no retornó un ID.");
                }

                finalPatientId = newPatient.patientId;
                toast.success(`Paciente registrado con éxito.`);
            }

            // ==========================================================
            // SCENARIO 2: Paciente EXISTENTE (isPatientFound = true) 
            // O Paciente recién creado (finalPatientId != null)
            // ==========================================================

            if (!finalPatientId) {
                throw new Error("Error: No se pudo obtener el ID del paciente para registrar el turno.");
            }

            // 2. Crear el Turno
            const shiftPayload = {
                ...baseShiftPayload,
                patientId: finalPatientId, // Usamos el ID del paciente (existente o nuevo)
            };

            console.log("Payload para crear turno:", shiftPayload);
            // Endpoint: POST /shift/
            await createShift(shiftPayload);

            // 3. Éxito y Reset
            toast.success(`Turno reservado con éxito.`);

            if (onShiftCreated) {
                onShiftCreated();
            }
            handleResetClick();

        } catch (error) {
            console.error("Error al confirmar turno/crear paciente:", error.response?.data || error);
            toast.error("Ocurrió un error al reservar el turno. Verifique los datos e intente nuevamente.");
        } finally {
            setIsConfirmModalOpen(false);
            setIsLoading(false);
        }
    };

    const closeConfirmModal = () => {
        if (!isLoading) {
            setIsConfirmModalOpen(false);
            setErrors((prev) => ({ ...prev, reason: null }));
        }
    };

    const handleResetClick = () => {
        setFormData({
            patient: {
                dni: "",
                firstName: "",
                lastName: "",
                telephone: "",
                birthDate: "",
                email: "",
                membershipNumber: "",
                socialWorkId: "",
            },
            specialtyId: "",
            doctorId: "",
            date: "",
            time: "",
            reason: "",
        });
        setSelectedDoctorDetails(null);
        setSelectedShift(null);
        setSelectedWeek(undefined);
        setIsPatientFound(false);
        setIsPatientManual(false);
        setExistingPatientId(null);
        setErrors({});
    };

    const showPatientFields = isPatientManual || isPatientFound;

    const getSelectedSpecialtyLabel = () => {
        const found = specialtyOptions.find(
            (opt) => String(opt.value) === String(formData.specialtyId)
        );
        return found ? found.label : "-";
    };

    const getSelectedSocialWorkLabel = () => {
        const found = socialWorkOptions.find(
            (opt) => String(opt.value) === String(formData.patient.socialWorkId)
        );
        return found ? found.label : "-";
    };

    return (
        <div className="my-4 mx-2">
            <form
                className="grid grid-cols-5 items-start m-2 gap-4 bg-transparent w-full"
                onSubmit={handleOpenConfirmation}
                noValidate
            >
                <div className="col-span-5 flex items-center justify-between gap-4">
                    <div className="w-[40%] flex items-start gap-4">
                        <div className="flex-1">
                            <Input
                                tittle="DNI"
                                name="dni"
                                value={formData.patient.dni}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.dni}
                                required
                                className="w-full"
                                disable={isLoading}
                            />
                        </div>

                        <div className="shrink-0 mt-7 flex flex-row gap-4 items-center">
                            <Button
                                text={"Buscar"}
                                icon={<FaSearch />}
                                variant={"primary"}
                                type={"button"}
                                onClick={handleSearchPatient}
                                size={"big"}
                                isLoading={isLoading}
                                disable={isLoading}
                            />
                            <motion.div whileTap={{ scale: 0.9, rotate: -180 }}>
                                <IconButton
                                    icon={<LiaUndoAltSolid size={30} />}
                                    type={"button"}
                                    onClick={handleResetClick}
                                    disable={isLoading}
                                />
                            </motion.div>
                        </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-center justify-center gap-2">
                        <span className="text-custom-dark-blue font-regular text-center text-sm">
                            Paciente sin <br /> usuario (Nuevo)
                        </span>
                        <div onClick={isPatientFound ? null : handleToggleChange} className={isPatientFound ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
                            <ToggleSwitch isOn={isPatientManual} disabled={isPatientFound} />
                        </div>
                    </div>
                </div>

                {/* SECCIÓN DE DATOS DE PACIENTE */}
                <AnimatePresence>
                    {showPatientFields && (
                        <motion.div
                            className="col-span-5"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="grid grid-cols-4 items-start justify-center gap-4 bg-custom-light-blue/50 py-4 px-4 rounded-2xl">
                                <Input
                                    tittle="Nombre"
                                    name="firstName"
                                    value={formData.patient.firstName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.firstName}
                                    size="small"
                                    required
                                    disable={isPatientFound && !isPatientManual}
                                />
                                <Input
                                    tittle="Apellido"
                                    name="lastName"
                                    value={formData.patient.lastName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.lastName}
                                    size="small"
                                    required
                                    disable={isPatientFound && !isPatientManual}
                                />
                                <Input
                                    tittle="Teléfono"
                                    name="telephone"
                                    value={formData.patient.telephone}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.telephone}
                                    size="small"
                                    required
                                    disable={isPatientFound && !isPatientManual}
                                />
                                <Input
                                    tittle="Email"
                                    name="email"
                                    value={formData.patient.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.email}
                                    size="small"
                                    disable={isPatientFound && !isPatientManual}
                                />
                                <Input
                                    tittle="Fecha de Nacimiento"
                                    name="birthDate"
                                    type="date"
                                    value={formData.patient.birthDate}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.birthDate}
                                    size="small"
                                    disable={isPatientFound && !isPatientManual}
                                />
                                <Input
                                    tittle="Número de Afiliado"
                                    name="membershipNumber"
                                    value={formData.patient.membershipNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.membershipNumber}
                                    size="small"
                                    disable={
                                        (isPatientFound && !isPatientManual) ||
                                        isLoading ||
                                        isParticularSelected()
                                    }
                                    placeholder={isParticularSelected() ? "No requerido" : ""}
                                />
                                <Select
                                    tittle="Obra Social"
                                    name="socialWorkId"
                                    value={formData.patient.socialWorkId}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.socialWorkId}
                                    options={socialWorkOptions}
                                    size="small"
                                    required
                                    disable={isPatientFound && !isPatientManual}
                                />
                                {/* Espacio en blanco para completar la grilla */}
                                <div className="hidden sm:block"></div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="col-span-5 grid grid-cols-4 gap-4 mt-2">
                    <Select
                        tittle="Especialidad"
                        name="specialtyId"
                        value={formData.specialtyId}
                        onChange={handleChange}
                        options={specialtyOptions}
                        onBlur={handleBlur}
                        error={errors.specialtyId}
                        disable={isLoading}
                    />
                    <Select
                        tittle="Médico"
                        name="doctorId"
                        value={formData.doctorId}
                        onChange={handleChange}
                        options={doctorOptionsWithEmpty}
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
                        error={errors.date}
                    />
                    <Input
                        tittle="Horario"
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        disable={true} // Se selecciona del WeeklySlots
                        error={errors.time}
                    />
                </div>

                <div className="col-span-5">
                    <AnimatePresence>
                        {selectedDoctorDetails && (
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
                                            Dr/a. {selectedDoctorDetails.firstName}{" "}
                                            {selectedDoctorDetails.lastName}
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
                </div>

                <div className="col-span-5 flex flex-row items-center justify-center h-full gap-5 text-white">
                    <Button
                        text={"Confirmar"}
                        variant={"primary"}
                        type={"submit"}
                        size={"big"}
                        disable={isLoading || !showPatientFields || errors.dni || errors.firstName || errors.lastName || errors.socialWorkId}
                    />
                </div>
            </form>

            <Modal isOpen={isConfirmModalOpen} onClose={closeConfirmModal}>
                <PrincipalCard
                    title="Confirmar Nuevo Turno"
                    content={
                        <div className="flex flex-col items-center gap-5 p-4 w-full min-w-lg">
                            <div className="bg-gray-50 p-4 rounded-lg w-full border border-gray-200">
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold text-gray-600">Paciente:</span>
                                    <span className="text-custom-dark-blue font-bold">
                                        {formData.patient.firstName} {formData.patient.lastName}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold text-gray-600">Obra Social:</span>
                                    <span className="text-custom-dark-blue">
                                        {getSelectedSocialWorkLabel()} (Afiliado: {formData.patient.membershipNumber || 'N/A'})
                                    </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold text-gray-600">
                                        Especialidad:
                                    </span>
                                    <span className="text-custom-dark-blue">
                                        {getSelectedSpecialtyLabel()}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold text-gray-600">Médico:</span>
                                    <span className="text-custom-dark-blue">
                                        {selectedDoctorDetails
                                            ? `Dr/a. ${selectedDoctorDetails.firstName} ${selectedDoctorDetails.lastName}`
                                            : "-"}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold text-gray-600">Fecha:</span>
                                    <span className="text-custom-dark-blue">{formData.date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-600">Hora:</span>
                                    <span className="text-custom-dark-blue font-bold">
                                        {formData.time} hs
                                    </span>
                                </div>
                            </div>

                            <p className="text-center font-semibold text-md text-custom-dark-blue">
                                Es importante que complete el motivo de consulta
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
                                className="w-full"
                            />

                            <div className="flex flex-row gap-6 w-full justify-center mt-4">
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
                                    isLoading={isLoading}
                                    disable={isLoading || errors.reason || !formData.reason}
                                />
                            </div>
                        </div>
                    }
                />
            </Modal>
        </div>
    );
};

export default AdminNewShift;