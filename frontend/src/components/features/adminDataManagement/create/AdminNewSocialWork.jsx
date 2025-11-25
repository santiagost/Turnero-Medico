import React, { useState } from 'react';
import Input from '../../../ui/Input';
import Button from '../../../ui/Button';
import { useToast } from '../../../../hooks/useToast';
import { adminCreateSocialWorkSchema } from '../../../../validations/adminSchemas';
import { createSocialWork } from '../../../../../services/socialWork.service';

const initialSocialWorkState = {
    name: "",
    cuit: "",
    telephone: "",
    address: "",
    email: ""
};

const AdminNewSocialWork = ({ refresh }) => {
    const [socialWorkData, setSocialWorkData] = useState(initialSocialWorkState);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSocialWorkData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const rule = adminCreateSocialWorkSchema[name];
        if (rule) {
            const error = rule(value, socialWorkData);
            setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        for (const name in adminCreateSocialWorkSchema) {
            const value = socialWorkData[name];
            const rule = adminCreateSocialWorkSchema[name];
            const error = rule(value, socialWorkData);
            if (error) {
                newErrors[name] = error;
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = validateForm();

        if (!isValid) {
            toast.warning("Por favor, completa todos los campos correctamente.");
            return;
        }

        setIsLoading(true);

        try {
            const data = await createSocialWork(socialWorkData);
            if (refresh) {
                refresh(prev => prev + 1);
            }

            toast.success("Obra Social registrada exitosamente.");

            // Limpiar formulario
            setSocialWorkData(initialSocialWorkState);
            setErrors({});

        } catch (error) {
            console.error("Error al crear obra social:", error);
            toast.error("Ocurrió un error al registrar la obra social.");
        } finally {
            setIsLoading(false); // Desactivar spinner
        }
    };
    return (
        <div className="p-4">
            <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4" noValidate>
                <Input
                    tittle="Nombre"
                    name="name"
                    value={socialWorkData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.name}
                    size="small"
                    required
                    disable={isLoading}
                />
                <Input
                    tittle="CUIT"
                    name="cuit"
                    value={socialWorkData.cuit}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.cuit}
                    size="small"
                    required
                    disable={isLoading}
                />
                <Input
                    tittle="Teléfono"
                    name="telephone"
                    type="tel"
                    value={socialWorkData.telephone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.telephone}
                    size="small"
                    required
                    disable={isLoading}
                />


                <div className="col-span-2">
                    <Input
                        tittle="Dirección"
                        name="address"
                        value={socialWorkData.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.address}
                        size="small"
                        required
                        disable={isLoading}
                    />
                </div>
                <div className="col-span-2">
                    <Input
                        tittle="Correo Electrónico"
                        name="email"
                        type="email"
                        value={socialWorkData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.email}
                        size="small"
                        required
                        disable={isLoading}
                    />
                </div>

                <div className="col-start-1 col-span-4 flex justify-center items-center">
                    <Button
                        text="Guardar Obra Social en el Sistema"
                        variant="primary"
                        type="submit"
                        size="big"
                        isLoading={isLoading}
                    />
                </div>

            </form>
        </div>
    );
};

export default AdminNewSocialWork;