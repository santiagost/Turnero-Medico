import React, { useState, useEffect } from 'react';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import Button from '../../../ui/Button';

// 1. Importa los mocks de Pacientes y Obras Sociales, y el esquema de Paciente
import { mockPatients, socialWorkOptions } from '../../../../utils/mockData';
import ROLES, { adminCreatePatientSchema } from '../../../../utils/utilities';

// 2. Define el estado inicial para Paciente
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

const AdminEditPatient = ({ patientId, onSave, onCancel }) => {
    const [patientData, setPatientData] = useState(initialPatientState);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        console.log("Cargando datos del paciente ID:", patientId);

        const patient = mockPatients.find(p => p.patientId === patientId);
        

        if (patient) {
            setPatientData({
                firstName: patient.firstName,
                lastName: patient.lastName,
                dni: patient.dni,
                profile: ROLES["Patient"],
                telephone: patient.telephone,
                birthDate: patient.birthDate,
                email: patient.user.email,
                membershipNumber: patient.membershipNumber,
                socialWorkId: patient.socialWork?.socialWorkId || ""
            });
        }
    }, [patientId]);

    // --- Handlers (usando el esquema de Paciente) ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPatientData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        // 4. Usa el esquema de Paciente
        const rule = adminCreatePatientSchema[name];
        if (rule) {
            const error = rule(value, patientData);
            setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        // 4. Usa el esquema de Paciente
        for (const name in adminCreatePatientSchema) {
            const value = patientData[name];
            const rule = adminCreatePatientSchema[name];
            const error = rule(value, patientData);
            if (error) { newErrors[name] = error; }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const isValid = validateForm();

        if (isValid) {
            console.log("Datos del paciente a actualizar:", patientData);
            if (onSave) {
                onSave(patientData);
            }
        } else {
            alert("Por favor, corrige los errores en el formulario.");
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="p-4">
            {/* 5. El JSX es el mismo que AdminNewPatient */}
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
                    value={patientData.profile}
                    _ size="small"
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
                    D onBlur={handleBlur}
                    error={errors.birthDate}
                    size="small"
                    required
                    _ />
                <div className='col-start-3 col-span-2'>
                    <Input
                        tittle="Correo Electrónico"
                        name="email"
                        value={patientData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        D error={errors.email}
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
                    s error={errors.membershipNumber}
                    size="small"
                />
                <Select
                    img tittle="Obra Social"
                    name="socialWorkId"
                    value={patientData.socialWorkId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    D error={errors.socialWorkId}
                    options={socialWorkOptions}
                    placeholder="Ninguna" // Placeholder para 'sin obra social'
                    size="small"
                    required
                />

                {/* 6. Botones de Guardar y Cancelar */}
                <div className="col-span-4 flex justify-center mt-6 gap-10">
                    <Button
                        text="Cancelar"
                        variant="secondary"
                        type="button"
                        s size="big"
                        onClick={handleCancel}
                    />
                    <Button
                        text="Guardar Cambios"
                        variant="primary"
                        type="submit"
                        size="big"
                    />
                </div>
            </form>
        </div>
    );
};

export default AdminEditPatient;