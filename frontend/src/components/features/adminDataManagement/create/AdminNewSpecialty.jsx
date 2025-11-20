import React, { useState } from 'react';
import Input from '../../../ui/Input';
import Button from '../../../ui/Button';

import { adminCreateSpecialtySchema } from '../../../../validations/adminSchemas';

const initialSpecialtyState = {
    name: "",
    description: ""
};

const AdminNewSpecialty = () => {    
    const [specialtyData, setSpecialtyData] = useState(initialSpecialtyState);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSpecialtyData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const rule = adminCreateSpecialtySchema[name];
        if (rule) {
            const error = rule(value, specialtyData);
            setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        for (const name in adminCreateSpecialtySchema) {
            const value = specialtyData[name];
            const rule = adminCreateSpecialtySchema[name];
            const error = rule(value, specialtyData);
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
            console.log("Datos de la nueva Especialidad a guardar:", specialtyData);
            alert("Especialidad guardada exitosamente (simulado).");
            setSpecialtyData(initialSpecialtyState);
            setErrors({});
        }
    };

    return (
        <div className="p-4">
            <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4 items-center" noValidate>

                <Input
                    tittle="Nombre"
                    name="name"
                    value={specialtyData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.name}
                    size="small"
                    required
                />
                <div className='col-start-1 col-span-4'>
                    <Input
                        tittle="Descripción"
                        name="description"
                        value={specialtyData.description}
                        onChange={handleChange}
                        multiline={true}
                        rows={3}
                        onBlur={handleBlur}
                        error={errors.description}
                        size="small"
                        required
                    />
                </div>

                <div className="col-start-1 col-span-4 flex justify-center items-center">
                    <Button
                        text="Guardar Especialidad en el Sistema"
                        variant="primary"
                        type="submit"
                        size="big"
                    />
                </div>

            </form>
        </div>
    );
};

export default AdminNewSpecialty;