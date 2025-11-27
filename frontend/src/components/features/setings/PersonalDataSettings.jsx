import React, { useState, useEffect } from 'react';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Button from '../../ui/Button';
import { getEditValidationSchema } from '../../../validations/authSchemas';
import ROLES from '../../../utils/constants';
import { useToast } from '../../../hooks/useToast';

import Modal from '../../ui/Modal';
import PrincipalCard from '../../ui/PrincipalCard';

import { getSocialWorkOptions } from '../../../../services/socialWork.service'
import { editDoctor } from '../../../../services/doctor.service';
import { editPatient } from '../../../../services/patient.service';
import { useAuth } from '../../../hooks/useAuth'

const PersonalDataSettings = () => {
    const { user, profile, updateProfileContext } = useAuth();
    
    const toast = useToast();
    const [editMode, setEditMode] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        dni: "",
        role: "",
        telephone: "",
        birthDate: "",
        email: "",
        membershipNumber: "",
        socialWork: "",
        specialty: "",
        licenseNumber: "",
    });

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);

    const isPatient = user.role === 'Patient';
    const isDoctor = user.role === 'Doctor';
    const isAdmin = user.role === 'Admin';

    const canEdit = !isAdmin;

    const [socialWorks, setSocialWorksOptions] = useState([
        { value: "", label: "" }
    ]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {

                const socialWorkFromBackend = await getSocialWorkOptions();

                setSocialWorksOptions([
                    ...socialWorkFromBackend
                ]);


            } catch (error) {
                console.error("No se pudieron cargar las opciones", error);
            }
        };

        fetchOptions();
    }, []);

    useEffect(() => {
        if (profile && user) {
            const socialWorkId = profile.socialWork?.socialWorkId;
            setFormData({
                firstName: profile.firstName || "",
                lastName: profile.lastName || "",
                dni: profile.dni || "",
                role: `${ROLES[user.role] || '...'}`,
                telephone: profile.telephone || "",
                birthDate: profile.birthDate || "",
                email: user.email || "",
                membershipNumber: profile.membershipNumber || "",
                socialWork: String(socialWorkId) || "",
                specialty: profile.specialty?.name || "",
                licenseNumber: profile.licenseNumber || "",
            });
        }
    }, [user, profile, socialWorks]);

    const isParticularSelected = () => {
        if (!formData.socialWork || !socialWorks) return false;
        const selectedOption = socialWorks.find(sw => sw.value == formData.socialWork);
        return selectedOption && selectedOption.label === "Particular";
    };

    const getParticularId = () => {
        if (!socialWorks) return null;
        const particularOption = socialWorks.find(sw => sw.label === "Particular");
        return particularOption ? particularOption.value : null;
    };

    const updateFormData = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => {
            const newData = { ...prevData, [name]: value };

            if (name === "socialWork") {
                const selectedOption = socialWorks.find(sw => sw.value == value);
                if (selectedOption && selectedOption.label === "Particular") {
                    newData.membershipNumber = "";
                }
            }
            return newData;
        });

        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const particularId = getParticularId();
        const schema = getEditValidationSchema(user.role, particularId);
        const rule = schema[name];
        if (rule) {
            const error = rule(value, formData);
            setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const particularId = getParticularId();
        const schema = getEditValidationSchema(user.role, particularId);
        for (const name in schema) {
            const value = formData[name];
            const rule = schema[name];
            const error = rule(value, formData);
            if (error) {
                newErrors[name] = error;
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const toggleEditMode = () => {
        if (canEdit) {
            setEditMode(true);
        } else {
            toast.info("Los administradores no pueden modificar sus datos personales desde esta sección.");
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        const isValid = validateForm();

        if (isValid) {
            setIsConfirmModalOpen(true);
        } else {
            toast.warning("Por favor, verifica los campos incompletos o incorrectos.");
            console.log("Errores de validación:", errors);
        }
    };

    const confirmSave = async () => {
        setLoadingSave(true);
        setIsConfirmModalOpen(false);

        let profileId = null;
        let serviceCall = null;
        let dataToSend = {};

        try {
            if (isPatient) {
                profileId = profile.patientId;
                const particularId = getParticularId();


                let finalSocialWorkId = formData.socialWork;
                let finalMembershipNumber = formData.membershipNumber;

                if (formData.socialWork == particularId) {
                    finalMembershipNumber = null;
                }
                if (finalMembershipNumber !== null && finalMembershipNumber === "") {
                    finalMembershipNumber = null;
                }

                dataToSend = {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    birthDate: profile.birthDate,
                    telephone: formData.telephone,
                    socialWorkId: finalSocialWorkId,
                    membershipNumber: finalMembershipNumber,
                };

                serviceCall = editPatient(profileId, dataToSend);

            } else if (isDoctor) {
                profileId = profile.doctorId;

                dataToSend = {
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    telephone: formData.telephone,
                    specialtyId: profile.specialty?.specialtyId,
                };

                serviceCall = editDoctor(profileId, dataToSend);

            } else {
                // --- Lógica para Admin (No editable) ---
                toast.warning("El administrador no puede modificar sus datos.");
                setLoadingSave(false);
                return;
            }


            const updatedProfileData = await serviceCall;
            updateProfileContext(updatedProfileData);
            toast.success("Datos actualizados correctamente.");

            // Limpiar y resetear el modo edición
            setEditMode(false);

        } catch (error) {
            console.error(`Error al guardar datos de ${user.role}:`, error);

            const errorData = error.response?.data || error;
            toast.error("No se han podido aplicar los cambios, verificar los datos...");
            setIsConfirmModalOpen(false); // Reabrir el modal o mostrar un mensaje de error

        } finally {
            setLoadingSave(false);
        }
    };

    const closeConfirmModal = () => {
        if (!loadingSave) {
            setIsConfirmModalOpen(false);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setErrors({});
        if (profile && user) {
            const socialWorkId = profile.socialWork?.socialWorkId;

            setFormData({
                firstName: profile.firstName || "",
                lastName: profile.lastName || "",
                dni: profile.dni || "",
                role: `${ROLES[user.role] || '...'}`,
                telephone: profile.telephone || "",
                birthDate: profile.birthDate || "",
                email: user.email || "",
                membershipNumber: profile.membershipNumber || "",
                socialWork: String(socialWorkId) || "",
                specialty: profile.specialty?.name || "",
                licenseNumber: profile.licenseNumber || "",
            });
        }
    };

    const handleClearSocialWork = () => {
        const particularOption = socialWorks.find(sw => sw.label === "Particular");
        const particularValue = particularOption ? particularOption.value : "";

        setFormData(prevData => ({
            ...prevData,
            socialWork: particularValue,
            membershipNumber: ""
        }));

        setErrors(prev => ({ ...prev, socialWork: null, membershipNumber: null }));
    };

    const confirmationModalContent = (
        <Modal isOpen={isConfirmModalOpen} onClose={closeConfirmModal}>
            <PrincipalCard
                title="Confirmar Cambios"
                content={
                    <div className="flex flex-col items-center gap-6 p-2">
                        <p className="text-center text-custom-dark-blue">
                            Estás a punto de modificar tus datos personales.<br />
                            ¿Deseas guardar estos cambios?
                        </p>
                        <div className="flex flex-row gap-6 w-full justify-center">
                            <Button
                                text="Volver"
                                variant="secondary"
                                onClick={closeConfirmModal}
                                className="w-full"
                                disable={loadingSave}
                            />
                            <Button
                                text="Confirmar"
                                variant="primary"
                                onClick={confirmSave}
                                className="w-full"
                                isLoading={loadingSave}
                            />
                        </div>
                    </div>
                }
            />
        </Modal>
    );

    switch (user.role) {
        case 'Patient':
            return (
                <>
                    <form className='flex flex-col justify-between' onSubmit={handleSave}>
                        <div className='grid grid-cols-2 gap-x-6 gap-y-1 m-6'>
                            {/* --- Campos de Solo Lectura --- */}
                            <Input tittle={"Nombre"} name={"name"} value={formData.firstName} size={"small"} disable={true} />
                            <Input tittle={"Apellido"} name={"lastname"} value={formData.lastName} size={"small"} disable={true} />
                            <Input tittle={"DNI"} name={"dni"} value={formData.dni} size={"small"} disable={true} />
                            <Input tittle={"Perfil"} name={"role"} value={formData.role} disable={true} size={"small"} />
                            <Input tittle={"Fecha de Nacimiento"} type={"date"} name={"birthDate"} value={formData.birthDate} disable={true} size={"small"} />
                            <Input tittle={"Correo Electrónico"} type={"email"} name={"email"} value={formData.email} disable={true} size={"small"} />

                            {/* --- Campos Editables (Paciente) --- */}
                            <Input
                                tittle={"Teléfono"}
                                type={"tel"}
                                name={"telephone"}
                                value={formData.telephone}
                                disable={!editMode}
                                onChange={updateFormData}
                                size={"small"}
                                onBlur={handleBlur}
                                error={errors.telephone}
                            />
                            <Input
                                tittle={"Número de Afiliado"}
                                name={"membershipNumber"}
                                value={formData.membershipNumber}
                                disable={!editMode || isParticularSelected()}
                                onChange={updateFormData}
                                size={"small"}
                                onBlur={handleBlur}
                                error={errors.membershipNumber}
                                placeholder={isParticularSelected() ? "No requerido" : ""}
                            />
                            <div>
                                <Select
                                    tittle={"Obra Social"}
                                    name={"socialWork"}
                                    value={formData.socialWork}
                                    disable={!editMode}
                                    onChange={updateFormData}
                                    size={"small"}
                                    options={socialWorks}
                                    onBlur={handleBlur}
                                    error={errors.socialWork}
                                    placeholder={"Seleccione una opción"}
                                />


                                {editMode && (
                                    <div className="flex items-end justify-start py-1">
                                        <button
                                            type="button"
                                            onClick={handleClearSocialWork}
                                            className="text-sm text-custom-blue hover:text-custom-dark-blue cursor-pointer"
                                        >
                                            (Establecer como Particular)
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='flex flex-row items-end justify-end m-4 gap-4'>
                            {editMode ? (
                                <>
                                    <Button text={"Cancelar"} variant={"secondary"} type="button" onClick={handleCancel} />
                                    <Button text={"Guardar Cambios"} variant={"primary"} type="submit" />
                                </>
                            ) : (
                                <Button text={"Editar Datos"} variant={"secondary"} type="button" onClick={toggleEditMode} />
                            )}
                        </div>
                    </form>
                    {confirmationModalContent}
                </>
            )
        case 'Doctor':
        case 'Admin':
            return (
                <>
                    <form className='flex flex-col justify-between' onSubmit={handleSave}>
                        <div className='grid grid-cols-2 gap-x-6 gap-y-1 m-6'>
                            {isAdmin ? (
                                <>
                                    <Input
                                        tittle={"Perfil"}
                                        name={"role"}
                                        value={formData.role}
                                        disable={true}
                                        size={"small"}
                                    />
                                    {/* El correo se muestra en la segunda columna, debajo del perfil */}
                                    <Input
                                        tittle={"Correo Electrónico"}
                                        type={"email"}
                                        name={"email"}
                                        value={formData.email}
                                        disable={true}
                                        size={"small"}
                                    />
                                </>

                            ) : (
                                // Renderizar todos los campos para DOCTOR
                                <>
                                    {/* --- Campos de Solo Lectura (Doctor) --- */}
                                    <Input tittle={"Nombre"} name={"name"} value={formData.firstName} size={"small"} disable={true} />
                                    <Input tittle={"Apellido"} name={"lastname"} value={formData.lastName} size={"small"} disable={true} />
                                    <Input tittle={"DNI"} name={"dni"} value={formData.dni} size={"small"} disable={true} />
                                    <Input tittle={"Perfil"} name={"role"} value={formData.role} disable={true} size={"small"} />

                                    {/* --- Campo Editable (Doctor) --- */}
                                    <Input
                                        tittle={"Teléfono"}
                                        type={"tel"}
                                        name={"telephone"}
                                        value={formData.telephone}
                                        disable={!editMode || isAdmin} // isAdmin siempre deshabilitará
                                        onChange={updateFormData}
                                        size={"small"}
                                        onBlur={handleBlur}
                                        error={errors.telephone}
                                    />

                                    <Input tittle={"Correo Electrónico"} type={"email"} name={"email"} value={formData.email} disable={true} size={"small"} />

                                    {/* --- Campos Específicos de Doctor (Solo Lectura) --- */}
                                    <Input tittle={"Especialidad"} name={"specialty"} value={formData.specialty} size={"small"} disable={true} />
                                    <Input tittle={"Matrícula"} name={"licenseNumber"} value={formData.licenseNumber} size={"small"} disable={true} />
                                </>
                            )}
                        </div>

                        <div className='flex flex-row items-end justify-end m-4 gap-4'>
                            {user.role === 'Doctor' ? (
                                editMode ? (
                                    <>
                                        <Button text={"Cancelar"} variant={"secondary"} type="button" onClick={handleCancel} />
                                        <Button text={"Guardar Cambios"} variant={"primary"} type="submit" />
                                    </>
                                ) : (
                                    <Button text={"Editar Datos"} variant={"secondary"} type="button" onClick={toggleEditMode} />
                                )
                            ) : (
                                <span className='text-sm text-custom-gray'>
                                    Datos inmodificables por esta vía.
                                </span>
                            )}
                        </div>
                    </form>
                    {confirmationModalContent}
                </>
            )
        default:
            return (<div>Rol de usuario no reconocido.</div>)
    }
};

export default PersonalDataSettings;