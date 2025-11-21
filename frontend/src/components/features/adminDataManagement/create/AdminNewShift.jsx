import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addDays, format } from "date-fns";

import Calendar from "../../schedule/Calendar";
import WeeklySlots from "../../schedule/WeeklySlots";
import Select from "../../../ui/Select";
import Input from "../../../ui/Input";
import Button from "../../../ui/Button";
import Modal from "../../../ui/Modal";
import PrincipalCard from "../../../ui/PrincipalCard";
import IconButton from "../../../ui/IconButton";

import { FaSearch } from "react-icons/fa";
import { LiaUndoAltSolid } from "react-icons/lia";

import {
    specialtyOptions,
    socialWorkOptions,
    doctorOptions,
    mockDoctors,
    getMockDoctorSchedule,
    mockDoctorAvailability,
    mockPatients
} from "../../../../utils/mockData";

import { newAdminShiftSchema } from "../../../../validations/shiftSchemas"
import ToggleSwitch from "../../../ui/ToggleSwitch";

const sectionVariants = {
    hidden: { opacity: 0, height: 0, y: -20, transition: { duration: 0.3 } },
    visible: { opacity: 1, height: "auto", y: 0, transition: { duration: 0.2, delay: 0.1 } },
    exit: { opacity: 0, height: 0, y: -20, transition: { duration: 0.2 } },
};

const AdminNewShift = () => {
    const [isPatientManual, setIsPatientManual] = useState(false);
    const [isPatientFound, setIsPatientFound] = useState(false);

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
        specialty: "",
        doctor: "",
        date: "",
        time: "",
        reason: "",
    });

    const [errors, setErrors] = useState({});
    const [doctorScheduleConfig, setDoctorScheduleConfig] = useState([]);

    const [specialties, setSpecialties] = useState(specialtyOptions);
    const [socialWorks, setSocialWorks] = useState(socialWorkOptions);
    const [filteredDoctorOptions, setFilteredDoctorOptions] = useState(doctorOptions);
    const [selectedWeek, setSelectedWeek] = useState();
    const [selectedShift, setSelectedShift] = useState();
    const [currentWeekShifts, setCurrentWeekShifts] = useState([]);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const specialtyOptionsWithAll = [{ value: "", label: "" }, ...specialties];
    const socialWorksOptionsWithAll = [{ value: "", label: "" }, ...socialWorks];
    const doctorOptionsWithAll = [{ value: "", label: "" }, ...filteredDoctorOptions];

    const selectedDoctorObj = mockDoctors.find(
        (doc) => doc.doctorId === parseInt(formData.doctor)
    );

    const getSpecialtyName = () => {
        const found = specialties.find((s) => s.value === parseInt(formData.specialty));
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
            setFormData((prev) => ({ ...prev, date: "", time: "" }));
        }
    }, [selectedShift]);

    useEffect(() => {
        if (formData.doctor) {
            setDoctorScheduleConfig(mockDoctorAvailability);
        } else {
            setDoctorScheduleConfig([]);
        }
    }, [formData.doctor]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const patientFields = ["dni", "firstName", "lastName", "telephone", "membershipNumber", "socialWorkId"];

        if (patientFields.includes(name)) {
            setFormData((prev) => ({
                ...prev,
                patient: {
                    ...prev.patient,
                    [name]: value,
                },
            }));
            if (name === "dni" && isPatientFound) {
                setIsPatientFound(false);
            }
        } else if (name === "doctor") {
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
                    if (errors.specialty) setErrors((prev) => ({ ...prev, specialty: null }));
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
            setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
        }
    };

    const handleSearchPatient = () => {
        const dniToSearch = formData.patient.dni;
        console.log("Buscando DNI:", dniToSearch);

        if (!dniToSearch) {
            setErrors((prev) => ({ ...prev, dni: "Ingrese un DNI para buscar." }));
            return;
        }

        const foundPatient = mockPatients.find((p) => p.dni === dniToSearch);

        if (foundPatient) {
            const extractedSocialWorkId = foundPatient.socialWork
                ? foundPatient.socialWork.socialWorkId
                : foundPatient.socialWorkId || "";

            setFormData((prev) => ({
                ...prev,
                patient: {
                    ...prev.patient,
                    ...foundPatient,
                    socialWorkId: extractedSocialWorkId
                },
            }));
            setIsPatientFound(true);
            setErrors((prev) => ({ ...prev, dni: null }));
        } else {
            setIsPatientFound(false);
            if (!isPatientManual) {
                setFormData((prev) => ({
                    ...prev,
                    patient: {
                        ...prev.patient,
                        firstName: "",
                        lastName: "",
                        telephone: "",
                        membershipNumber: "",
                        socialWorkId: "",
                    },
                }));
                setErrors((prev) => ({ ...prev, dni: "Paciente no encontrado." }));
            } else {
                console.log("Paciente no encontrado en BD, continuar carga manual.");
            }
        }
    };

    const handleToggleChange = () => {
        const newState = !isPatientManual;
        setIsPatientManual(newState);

        if (!newState && !isPatientFound) {
            setFormData((prev) => ({
                ...prev,
                patient: {
                    ...prev.patient,
                    firstName: "",
                    lastName: "",
                    telephone: "",
                    membershipNumber: "",
                    socialWorkId: "",
                },
            }));
        }
    };


    const validateStep1 = () => {
        let step1Fields = ["specialty", "doctor", "date", "time"];
        if (isPatientManual || isPatientFound) {
            step1Fields = [
                ...step1Fields,
                "dni",
                "firstName",
                "lastName",
                "telephone",
                "socialWorkId",
                "membershipNumber"
            ];
        }

        const newErrors = {};
        let isValid = true;

        step1Fields.forEach((field) => {
            const rule = newAdminShiftSchema[field];

            if (rule) {
                const valueToValidate = formData.patient?.[field] !== undefined
                    ? formData.patient[field]
                    : formData[field];

                const error = rule(valueToValidate, formData);
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
            console.log("Errores de validación:", errors);
        }
    };

    const handleConfirmShift = () => {
        const reasonRule = newAdminShiftSchema.reason;
        const reasonError = reasonRule ? reasonRule(formData.reason) : null;

        if (reasonError) {
            setErrors(prev => ({ ...prev, reason: reasonError }));
            return;
        }

        console.log("Confirmado y enviando al backend:", formData);
        setIsConfirmModalOpen(false);

        setFormData({
            patient: { dni: "", firstName: "", lastName: "", telephone: "", membershipNumber: "", socialWorkId: "" },
            specialty: "", doctor: "", date: "", time: "", reason: ""
        });
        setSelectedWeek(undefined);
        setSelectedShift(undefined);
        setIsPatientFound(false);
        setIsPatientManual(false);
    };

    const closeConfirmModal = () => setIsConfirmModalOpen(false);

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const rule = newAdminShiftSchema[name];
        if (rule) {
            const error = rule(value, formData);
            setErrors((prev) => ({ ...prev, [name]: error }));
        }
    };

    const showPatientFields = isPatientManual || isPatientFound;

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
            specialty: "",
            doctor: "",
            date: "",
            time: "",
            reason: "",
        });
        setErrors({});
        setIsPatientManual(false);
        setIsPatientFound(false);
        setSelectedWeek(undefined);
        setSelectedShift(undefined);
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
                            />
                            <motion.div
                                whileTap={{ scale: 0.9, rotate: -180 }}
                            >
                                <IconButton
                                    icon={<LiaUndoAltSolid size={30} />}
                                    type={"button"}
                                    onClick={handleResetClick}
                                />
                            </motion.div>
                        </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-center justify-center gap-2">
                        <span className="text-custom-dark-blue font-regular text-center text-sm">
                            Paciente sin <br /> usuario
                        </span>
                        <div onClick={handleToggleChange} className="cursor-pointer">
                            <ToggleSwitch isOn={isPatientManual} />
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
                            <div className="flex flex-row items-start justify-center gap-4 bg-custom-light-blue/50 py-4 px-4 rounded-2xl">
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
                                    disable={isPatientFound && !isPatientManual}
                                />
                                <Select
                                    tittle="Obra Social"
                                    name="socialWorkId"
                                    value={formData.patient.socialWorkId}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.socialWorkId}
                                    options={socialWorksOptionsWithAll}
                                    size="small"
                                    required
                                    disable={isPatientFound && !isPatientManual}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="col-span-5 flex flex-row gap-4 mt-2">
                    <Select
                        tittle="Especialidad"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        options={specialtyOptionsWithAll}
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
                        error={errors.date}
                    />
                    <Input
                        tittle="Horario"
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        disable={true}
                        error={errors.time}
                    />
                </div>
                <div className="col-span-5 flex flex-row items-center justify-center h-full gap-5 text-white">
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
                                    Por favor, seleccione una semana para ver los turnos disponibles
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
                                />
                                <Button
                                    text="Confirmar Turno"
                                    variant="primary"
                                    onClick={handleConfirmShift}
                                    className="w-full"
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