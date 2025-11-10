import React, { useState } from 'react';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import Button from '../../../ui/Button';

import { socialWorkOptions } from '../../../../utils/mockData';
import ROLES, { adminCreatePatientSchema } from '../../../../utils/utilities';


const initialPatientState = {
    firstName: "",
    lastName: "",
    dni: "",
    profile: `${ROLES["Patient"]}`,
    telephone: "",
    birthDate: "",
    email: "",
    membershipNumber: "",
    socialWorkId: ""
};

const AdminNewPatient = () => {
    const [patientData, setPatientData] = useState(initialPatientState);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPatientData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const rule = adminCreatePatientSchema[name];
        if (rule) {
            const error = rule(value, patientData);
            setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        for (const name in adminCreatePatientSchema) {
            const value = patientData[name];
            const rule = adminCreatePatientSchema[name];
            const error = rule(value, patientData);
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
            console.log("Datos del nuevo paciente a guardar:", patientData);
            alert("Paciente guardado (simulado). Revisa la consola.");
            setPatientData(initialPatientState);
            setErrors({});
        }
    };

    return (
        <div className="p-4">
            <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4" noValidate>
                <Input
                    tittle="Nombre"
                    name="firstName"
                    value={patientData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.firstName}
                    size="small"
                    required
                />
                <Input
                    tittle="Apellido"
                    name="lastName"
                    value={patientData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.lastName}
                    size="small"
                    required
                />
                <Input
                    tittle="DNI"
                    name="dni"
                    value={patientData.dni}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.dni}
                    size="small"
                    required
                />

                <Input
                    tittle="Perfil"
                    name="profile"
                    type="text"
                    value={patientData.profile}
                    size="small"
                    disable={true}
                />

                <Input
                    tittle="Teléfono"
                    name="telephone"
                    value={patientData.telephone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.telephone}
                    size="small"
                />
                <Input
                    tittle="Fecha de Nacimiento"
                    name="birthDate"
                    value={patientData.birthDate}
                    type="date"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.birthDate}
                    size="small"
                    required
                />

                <div className='col-start-3 col-span-2'>
                    <Input
                        tittle="Correo Electrónico"
                        name="email"
                        value={patientData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.email}
                        size="small"
                        required
                    />
                </div>

                <Input
                    tittle="Número de Afiliado"
                    name="membershipNumber"
                    value={patientData.membershipNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.membershipNumber}
                    s size="small"
                />
                <Select
                    tittle="Obra Social"
                    name="socialWorkId"
                    value={patientData.socialWorkId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.socialWorkId}
                    options={socialWorkOptions}
                    size="small"
                    required
                />

                <div className="col-span-4 flex justify-center mt-6">
                    <Button
                        text="Guardar Paciente en el Sistema"
                        variant="primary"
                        type="submit"
                        size="big"
                    />
                </div>
            </form>
        </div>
    );
};

export default AdminNewPatient;