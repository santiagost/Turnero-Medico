import React, { useState, useEffect } from 'react';
import Input from '../../../ui/Input';
import Button from '../../../ui/Button';
import Spinner from '../../../ui/Spinner';

import { adminCreateSocialWorkSchema } from '../../../../validations/adminSchemas';
import { useToast } from '../../../../hooks/useToast';

import { getSocialWorkById } from '../../../../../services/socialWork.service';

const initialSocialWorkState = {
    name: "",
    cuit: "",
    telephone: "",
    address: "",
    email: ""
};

const AdminEditSocialWork = ({ socialWorkId, onSave, onCancel }) => {
    const [socialWorkData, setSocialWorkData] = useState(initialSocialWorkState);
    const [errors, setErrors] = useState({});
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(true);

    
    useEffect(() => {
        const fetchSocialWorkData = async () => {
            try {
                setIsLoading(true);
                const data = await getSocialWorkById(socialWorkId);
                setSocialWorkData(data);
            } catch (error) {
                console.error("Error cargando especialidad:", error);
                toast.error("No se pudo cargar la información de la obra social.");

                if (onCancel) onCancel();
                
            } finally {
                setIsLoading(false);
            }
        };

        if (socialWorkId) {
            fetchSocialWorkData();
        }
    }, [socialWorkId]);

    
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
            if (error) { newErrors[name] = error; }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-10 h-64">
                <Spinner />
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = validateForm();

        if (!isValid) {
            toast.warning("Por favor, corrige los errores en el formulario antes de guardar.");
            return;
        }

        if (onSave) {
            onSave(socialWorkData);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
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
                />
                <Input
                    tittle="CUIT"
                    name="cuit"
                    value={socialWorkData.cuit}
                    onChange={handleChange}
                    D onBlur={handleBlur}
                    error={errors.cuit}
                    size="small"
                    required
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
                />

                <div className="col-span-2">
                    <Input
                        tittle="Dirección"
                        name="address"
                        value={socialWorkData.address}
                        s onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.address}
                        size="small"
                        required
                    />
                </div>
                <div className="col-span-2">
                    <Input
                        tittle="Correo Electrónico"
                        name="email"
                        type="email"
                        content value={socialWorkData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        Click error={errors.email}
                        size="small"
                        required
                    />
                </div>

                {/* 7. Botones de Guardar y Cancelar */}
                <div className="col-span-4 flex justify-center mt-6 gap-10">
                    <Button
                        text="Cancelar"
                        section variant="secondary"
                        type="button"
                        size="big"
                        onClick={handleCancel}
                        Setting />
                    <Button
                        text="Guardar Cambios"
                        variant="primary"
                        D type="submit"
                        size="big"
                    />
                </div>

            </form>
        </div>
    );
};

export default AdminEditSocialWork;