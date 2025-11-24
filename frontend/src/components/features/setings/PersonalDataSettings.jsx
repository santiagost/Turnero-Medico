import React, { useState, useEffect } from 'react';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Button from '../../ui/Button';
import { getEditValidationSchema } from '../../../validations/authSchemas';
import ROLES from '../../../utils/constants';
import { useToast } from '../../../hooks/useToast';

import Modal from '../../ui/Modal';
import PrincipalCard from '../../ui/PrincipalCard';

const PersonalDataSettings = ({ user, profile, socialWorks }) => {
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

    useEffect(() => {
        if (profile && user) {
            setFormData({
                firstName: profile.firstName || "",
                lastName: profile.lastName || "",
                dni: profile.dni || "",
                role: `${ROLES[user.role] || '...'}`,
                telephone: profile.telephone || "",
                birthDate: profile.birthDate || "",
                email: user.email || "",
                membershipNumber: profile.membershipNumber || "",
                socialWork: profile.socialWork?.name || "",
                specialty: profile.specialty?.name || "",
                licenseNumber: profile.licenseNumber || "",
            });
        }
    }, [user, profile]);

    const updateFormData = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const schema = getEditValidationSchema(user.role);
        const rule = schema[name];
        if (rule) {
            const error = rule(value, formData);
            setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const schema = getEditValidationSchema(user.role);
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
        setEditMode(true);
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

        // AQUI VA LA LLAMADA AL BACKEND
        // const dataToSend = { ...formData, role: user.role };

        try {
            // Simulación de API (2 segundos)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Si es exitoso:
            // await axios.put('/api/users/profile', dataToSend); 

            toast.success("Datos actualizados correctamente.");

            // Cerramos todo
            setIsConfirmModalOpen(false);
            setEditMode(false);
            // 💡 Nota: Si la API devuelve el perfil actualizado, aquí actualizarías tu contexto Auth.

        } catch (error) {
            console.error("Error al guardar datos:", error);
            const errorMessage = error.response?.data?.message || "Error al conectar con el servidor.";
            toast.error(errorMessage);
        } finally {
            setLoadingSave(false); // 🟢 Desactivar spinner
        }
    };

    // 5. NUEVO: CERRAR MODAL (Asegurado contra clicks mientras carga)
    const closeConfirmModal = () => {
        if (!loadingSave) {
            setIsConfirmModalOpen(false);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setErrors({});
        if (profile && user) {
            setFormData({
                firstName: profile.firstName || "",
                lastName: profile.lastName || "",
                dni: profile.dni || "",
                role: `${ROLES[user.role] || '...'}`,
                telephone: profile.telephone || "",
                birthDate: profile.birthDate || "",
                email: user.email || "",
                membershipNumber: profile.membershipNumber || "",
                socialWork: profile.socialWork?.name || "",
                specialty: profile.specialty?.name || "",
                licenseNumber: profile.licenseNumber || "",
            });
        }
    };

    const handleClearSocialWork = () => {
        setFormData(prevData => ({
            ...prevData,
            membershipNumber: "",
            socialWork: ""
        }));
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
                                disable={!editMode}
                                onChange={updateFormData}
                                size={"small"}
                                onBlur={handleBlur}
                                error={errors.membershipNumber}
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
                                    placeholder={"Ninguna"}
                                />


                                {editMode && (
                                    <div className="flex items-end justify-start py-1">
                                        <button
                                            type="button"
                                            onClick={handleClearSocialWork}
                                            className="text-sm text-custom-blue hover:text-custom-dark-blue cursor-pointer"
                                        >
                                            (Limpiar obra social)
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
                            {/* --- Campos de Solo Lectura (Doctor/Admin) --- */}
                            <Input tittle={"Nombre"} name={"name"} value={formData.firstName} size={"small"} disable={true} />
                            <Input tittle={"Apellido"} name={"lastname"} value={formData.lastName} size={"small"} disable={true} />
                            <Input tittle={"DNI"} name={"dni"} value={formData.dni} size={"small"} disable={true} />
                            <Input tittle={"Perfil"} name={"role"} value={formData.role} disable={true} size={"small"} />

                            {/* --- Campo Editable (Doctor/Admin) --- */}
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

                            <Input tittle={"Correo Electrónico"} type={"email"} name={"email"} value={formData.email} disable={true} size={"small"} />

                            {/* --- Campos Específicos de Doctor (Solo Lectura) --- */}
                            {user.role === 'Doctor' && (
                                <>
                                    <Input tittle={"Especialidad"} name={"specialty"} value={formData.specialty} size={"small"} disable={true} />
                                    <Input tittle={"Matrícula"} name={"matricula"} value={formData.licenseNumber} size={"small"} disable={true} />
                                </>
                            )}
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
        default:
            return (<div>Rol de usuario no reconocido.</div>)
    }
};

export default PersonalDataSettings;