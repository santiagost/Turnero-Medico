import React, { useState, useEffect } from 'react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ROLES, { getEditValidationSchema } from '../../utils/utilities';

const PersonalDataSettings = ({ user, socialWorks }) => {
    const [editMode, setEditMode] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: user.name || "",
        lastname: user.lastname || "",
        dni: user.dni || "",
        role: `${ROLES[user?.role] || '...'}`,
        telephone: user.telephone || "",
        birthDate: user.birthDate || "",
        email: user.email || "",
        membershipNumber: user.membershipNumber || "",
        socialWork: user.socialWork || "",
        specialty: user.specialty || "",
        matricula: user.matricula || "",
    });

    useEffect(() => {
        setFormData({
            name: user.name || "",
            lastname: user.lastname || "",
            dni: user.dni || "",
            role: `${ROLES[user?.role] || '...'}`,
            telephone: user.telephone || "",
            birthDate: user.birthDate || "",
            email: user.email || "",
            membershipNumber: user.membershipNumber || "",
            socialWork: user.socialWork || "",
            specialty: user.specialty || "",
            matricula: user.matricula || "",
        });
    }, [user]);

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
            console.log("Guardando datos:", formData);
            // ... Lógica de API ...
            setEditMode(false);
        } else {
            console.log("Errores de validación:", errors);
            alert("Por favor, corrige los campos marcados.");
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setErrors({});
        setFormData({
            name: user.name || "",
            lastname: user.lastname || "",
            dni: user.dni || "",
            role: `${ROLES[user?.role] || '...'}`,
            telephone: user.telephone || "",
            birthDate: user.birthDate || "",
            email: user.email || "",
            membershipNumber: user.membershipNumber || "",
            socialWork: user.socialWork || "",
            specialty: user.specialty || "",
            matricula: user.matricula || "",
        });
    };

    const handleClearSocialWork = () => {
        setFormData(prevData => ({
            ...prevData,
            membershipNumber: "",
            socialWork: ""
        }));
    };

    switch (user.role) {
        case 'Patient':
            return (
                <form className='flex flex-col justify-between' onSubmit={handleSave}>
                    <div className='grid grid-cols-2 gap-x-6 gap-y-1 m-6'>
                        {/* --- Campos de Solo Lectura --- */}
                        <Input tittle={"Nombre"} name={"name"} value={formData.name} size={"small"} disable={true} />
                        <Input tittle={"Apellido"} name={"lastname"} value={formData.lastname} size={"small"} disable={true} />
                        <Input tittle={"DNI"} name={"dni"} value={formData.dni} size={"small"} disable={true} />
                        <Input tittle={"Perfil"} name={"role"} value={formData.role} disable={true} size={"small"} />
                        <Input tittle={"Fecha de Nacimiento"} type={"date"} name={"birthDate"} value={formData.birthDate} disable={true} size={"small"} />
                        <Input tittle={"Correo Electrónico"} type={"email"} name={"email"} value={formData.email} disable={true} size={"small"} />

                        {/* --- Campos Editables (Paciente) --- */}
                        <Input
                            tittle={"Teléfono"}
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
            )
        case 'Doctor':
        case 'Admin':
            return (
                <form className='flex flex-col justify-between' onSubmit={handleSave}>
                    <div className='grid grid-cols-2 gap-x-6 gap-y-1 m-6'>
                        {/* --- Campos de Solo Lectura (Doctor/Admin) --- */}
                        <Input tittle={"Nombre"} name={"name"} value={formData.name} size={"small"} disable={true} />
                        <Input tittle={"Apellido"} name={"lastname"} value={formData.lastname} size={"small"} disable={true} />
                        <Input tittle={"DNI"} name={"dni"} value={formData.dni} size={"small"} disable={true} />
                        <Input tittle={"Perfil"} name={"role"} value={formData.role} disable={true} size={"small"} />

                        {/* --- Campo Editable (Doctor/Admin) --- */}
                        <Input
                            tittle={"Teléfono"}
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
                                <Input tittle={"Matrícula"} name={"matricula"} value={formData.matricula} size={"small"} disable={true} />
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
            )
        default:
            return (<div>Rol de usuario no reconocido.</div>)
    }
};

export default PersonalDataSettings;