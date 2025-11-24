import React, { useState } from 'react';

import { motion, AnimatePresence } from "framer-motion";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { useToast } from '../../../hooks/useToast';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import ToggleSwitch from '../../ui/ToggleSwitch';

import { securityValidationSchema } from '../../../validations/authSchemas';

const SecuritySettings = () => {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const toast = useToast();
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [enablePasswordChange, setEnablePasswordChange] = useState(false);
    const handleToggleChange = (newValue) => {
        if (!newValue) {
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setErrors({});
            setIsDirty(false);
        }
        setEnablePasswordChange(newValue);
    };


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

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        const isValid = validateForm();

        if (!isValid) {
            toast.warning("Por favor, verifica que todos los campos de contraseña sean válidos.");
            return;
        }

        setIsLoading(true);

        try {
            // AQUI VA LA LLAMADA AL BACKEND
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simulación de error de contraseña actual incorrecta
            if (formData.currentPassword === "error") {
                throw { response: { data: { message: "La contraseña actual es incorrecta." } } };
            }

            toast.success("Contraseña actualizada exitosamente.");

            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setErrors({});
            setIsDirty(false);


            setTimeout(() => {
                setEnablePasswordChange(false);
            }, 500);

        } catch (error) {
            console.error("Error al actualizar contraseña:", error);

            const errorMessage = error.response?.data?.message || "Ocurrió un error inesperado al actualizar.";
            toast.error(errorMessage);

            // Si el error es específico de la contraseña actual (mock), limpiamos solo ese campo
            if (errorMessage.includes("incorrecta")) {
                setErrors(prev => ({ ...prev, currentPassword: errorMessage }));
            }

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className='flex flex-col m-6' onSubmit={handleOnSubmit} noValidate>
            <div className="flex flex-row items-center gap-4 ">
                <div className="flex flex-col flex-1">
                    <h3 className="font-bold text-lg text-custom-dark-blue">
                        ¿Desea modificar su contraseña?
                    </h3>
                    <span className="text-xs text-custom-gray">
                        Active esta opción para habilitar el formulario.
                    </span>
                </div>

                <ToggleSwitch
                    isOn={enablePasswordChange}
                    onToggle={handleToggleChange}
                />
            </div>

            <AnimatePresence>
                {enablePasswordChange && (
                    <motion.div
                        key="security-form-container"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 flex flex-col gap-y-1">

                            <Input
                                tittle={"Contraseña Actual"}
                                type={showCurrent ? "text" : "password"}
                                name={"currentPassword"}
                                value={formData.currentPassword}
                                onChange={updateFormData}
                                onBlur={handleBlur}
                                error={errors.currentPassword}
                                size={"small"}
                                icon={showCurrent ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
                                useButton={() => setShowCurrent(prev => !prev)}
                                disable={isLoading}
                            />

                            <div className="grid grid-cols-2 gap-x-6">
                                <Input
                                    tittle={"Nueva Contraseña"}
                                    type={showNew ? "text" : "password"}
                                    name={"newPassword"}
                                    value={formData.newPassword}
                                    onChange={updateFormData}
                                    onBlur={handleBlur}
                                    error={errors.newPassword}
                                    size={"small"}
                                    icon={showNew ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
                                    useButton={() => setShowNew(prev => !prev)}
                                    disable={isLoading}
                                />

                                <Input
                                    tittle={"Confirmar Contraseña"}
                                    type={showConfirm ? "text" : "password"}
                                    name={"confirmPassword"}
                                    value={formData.confirmPassword}
                                    onChange={updateFormData}
                                    onBlur={handleBlur}
                                    error={errors.confirmPassword}
                                    size={"small"}
                                    icon={showConfirm ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
                                    useButton={() => setShowConfirm(prev => !prev)}
                                    disable={isLoading}
                                />
                            </div>

                            <div className="flex flex-row items-center justify-center mt-6 mb-2">
                                <Button
                                    text={"Actualizar Contraseña"}
                                    variant={isDirty ? "primary" : "disabled"}
                                    type="submit"
                                    disable={!isDirty}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </form>
    );
};

export default SecuritySettings;