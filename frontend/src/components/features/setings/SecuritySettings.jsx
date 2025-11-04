import React, { useState } from 'react';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

import { securityValidationSchema } from '../../../utils/utilities';

const SecuritySettings = () => {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const updateFormData = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
        setIsDirty(true);
        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const rule = securityValidationSchema[name];
        if (rule) {
            const error = rule(value, formData);
            setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        for (const name in securityValidationSchema) {
            const value = formData[name];
            const rule = securityValidationSchema[name];
            const error = rule(value, formData);
            if (error) {
                newErrors[name] = error;
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOnSubmit = (e) => {
        e.preventDefault();
        const isValid = validateForm();

        if (isValid) {
            // --- Validación de Contraseña Actual (Mock) ---
            // En un caso real, aquí enviarías los 3 campos a tu API
            // y la API te diría si 'currentPassword' es correcta.
            // Por ahora, simulamos que la contraseña correcta es "Messi2025".
            if (formData.currentPassword !== "Messi2025") {
                setErrors(prev => ({
                    ...prev,
                    currentPassword: "La contraseña actual es incorrecta."
                }));
                alert("La contraseña actual es incorrecta.");
                return;
            }

            console.log("Cambiando contraseña:", formData);
            alert("¡Contraseña actualizada con éxito!");
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setErrors({});
            setIsDirty(false);
        } else {
            console.log("Errores de validación:", errors);
        }
    };


    return (
        <form className='flex flex-col m-6' onSubmit={handleOnSubmit} noValidate>
            <h3 className="font-bold text-lg text-custom-dark-blue mb-4">
                Cambiar Contraseña
            </h3>
            
            <div className='flex flex-col gap-y-1'>
                <Input
                    tittle={"Contraseña Actual"}
                    type={showCurrent ? "text" : "password"}
                    name={"currentPassword"}
                    value={formData.currentPassword}
                    onChange={updateFormData}
                    onBlur={handleBlur}
                    error={errors.currentPassword}
                    size={"small"}
                    icon={showCurrent ? <FaRegEyeSlash size={25} /> : <FaRegEye size={25} />}
                    useButton={() => setShowCurrent(prev => !prev)}
                />
                
                <div className="grid grid-cols-2 gap-x-6">
                    {/* Nueva Contraseña */}
                    <Input
                        tittle={"Nueva Contraseña"}
                        type={showNew ? "text" : "password"}
                        name={"newPassword"}
                        value={formData.newPassword}
                        onChange={updateFormData}
                        onBlur={handleBlur}
                        error={errors.newPassword}
                        size={"small"}
                        icon={showNew ? <FaRegEyeSlash size={25} /> : <FaRegEye size={25} />}
                        useButton={() => setShowNew(prev => !prev)}
                    />
                    
                    {/* Confirmar Contraseña */}
                    <Input
                        tittle={"Confirmar Contraseña"}
                        type={showConfirm ? "text" : "password"}
                        name={"confirmPassword"}
                        value={formData.confirmPassword}
                        onChange={updateFormData}
                        onBlur={handleBlur}
                        error={errors.confirmPassword}
                        size={"small"}
                        icon={showConfirm ? <FaRegEyeSlash size={25} /> : <FaRegEye size={25} />}
                        useButton={() => setShowConfirm(prev => !prev)}
                    />
                </div>
            </div>

            <div className='flex flex-row items-center justify-center mt-6'>
                <Button 
                    text={"Actualizar Contraseña"} 
                    variant={isDirty ? "primary" : "disabled"} 
                    type="submit"
                    disable={!isDirty}
                />
            </div>
        </form>
    );
};

export default SecuritySettings;