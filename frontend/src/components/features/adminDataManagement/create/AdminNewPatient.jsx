import React, { useState } from 'react';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import Button from '../../../ui/Button';

import { socialWorkOptions } from '../../../../utils/mockData';
import { adminCreatePatientSchema } from '../../../../validations/adminSchemas';
import ROLES from '../../../../utils/constants';
import { useToast } from '../../../../hooks/useToast';

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
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const socialWorksOptionsWithAll = [{ value: "", label: "Ninguna" }, ...socialWorkOptions];

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValid = validateForm();

        if (!isValid) {
            toast.warning("Por favor, complete correctamente todos los campos requeridos.");
            return;
        }

        setIsLoading(true); // Activar spinner

        try {
            // AQUI VA LA LLAMADA AL BACKEND
            // await axios.post('/api/patients', patientData);

            // Simulación de espera
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulación de error (Descomentar para probar)
            // throw new Error("El DNI ya se encuentra registrado en el sistema.");

            console.log("Datos del nuevo paciente a guardar:", patientData);

            toast.success("Paciente registrado exitosamente.");

            // Limpiar formulario
            setPatientData(initialPatientState);
            setErrors({});

        } catch (error) {
            console.error("Error al crear paciente:", error);
            const errorMessage = error.message || "Ocurrió un error al intentar registrar al paciente.";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false); // Desactivar spinner
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
                    disable={isLoading}
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
                    disable={isLoading}
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
                    disable={isLoading}
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
                    disable={isLoading}
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
                    disable={isLoading}
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
                        disable={isLoading}
                    />
                </div>

                <Input
                    tittle="Número de Afiliado"
                    name="membershipNumber"
                    value={patientData.membershipNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.membershipNumber}
                    size="small"
                    disable={isLoading}
                />
                <Select
                    tittle="Obra Social"
                    name="socialWorkId"
                    value={patientData.socialWorkId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.socialWorkId}
                    options={socialWorksOptionsWithAll}
                    size="small"
                    required
                    disable={isLoading}
                />

                <div className="col-span-4 flex justify-center mt-6">
                    <Button
                        text="Guardar Paciente en el Sistema"
                        variant="primary"
                        type="submit"
                        size="big"
                        isLoading={isLoading}
                        disable={isLoading}
                    />
                </div>
            </form>
        </div>
    );
};

export default AdminNewPatient;