import React, { useState } from 'react';
import Input from '../../../ui/Input';
import Button from '../../../ui/Button';

import { adminCreateSocialWorkSchema } from '../../../../validations/adminSchemas';

const initialSocialWorkState = {
    name: "",
    cuit: "",
    telephone: "",
    address: "",
    email: ""
};

const AdminNewSocialWork = () => {
    const [socialWorkData, setSocialWorkData] = useState(initialSocialWorkState);
    const [errors, setErrors] = useState({});

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

    const handleSubmit = (e) => {
        e.preventDefault();
        const isValid = validateForm();

        if (isValid) {
            console.log("Datos de la nueva Obra Social a guardar:", socialWorkData);
            alert("Obra Social guardada exitosamente (simulado).");
            setSocialWorkData(initialSocialWorkState);
            setErrors({});
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
                    onBlur={handleBlur}
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
                        onChange={handleChange}
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
                        value={socialWorkData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.email}
                        size="small"
                        required
                    />
                </div>

                <div className="col-start-1 col-span-4 flex justify-center items-center">
                    <Button
                        text="Guardar Obra Social en el Sistema"
                        variant="primary"
                        type="submit"
                        size="big"
                    />
                </div>

            </form>
        </div>
    );
};

export default AdminNewSocialWork;