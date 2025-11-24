import React, { useState } from 'react';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import Button from '../../../ui/Button';


import { specialtyOptions } from '../../../../utils/mockData';
import { adminCreateDoctorSchema } from '../../../../validations/adminSchemas';
import ROLES from '../../../../utils/constants';
import { useToast } from '../../../../hooks/useToast';

const initialDoctorState = {
    firstName: "",
    lastName: "",
    dni: "",
    profile: `${ROLES["Doctor"]}`,
    telephone: "",
    email: "",
    licenseNumber: "",
    specialtyId: ""
};

const AdminNewDoctor = () => {
    const [doctorData, setDoctorData] = useState(initialDoctorState);
    const [errors, setErrors] = useState({});
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDoctorData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const rule = adminCreateDoctorSchema[name];
        if (rule) {
            const error = rule(value, doctorData);
            setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        for (const name in adminCreateDoctorSchema) {
            const value = doctorData[name];
            const rule = adminCreateDoctorSchema[name];
            const error = rule(value, doctorData);
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
            // await axios.post('/api/doctors', doctorData);

            // Simulación de espera
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Simulación de error (Descomentar para probar)
            // throw new Error("El correo electrónico ya está registrado.");

            console.log("Datos del nuevo médico a guardar:", doctorData);

            toast.success("Médico registrado exitosamente en el sistema.");

            // Limpiar formulario
            setDoctorData(initialDoctorState);
            setErrors({});

        } catch (error) {
            console.error("Error al crear médico:", error);
            const errorMessage = error.response?.data?.message || error.message || "Ocurrió un error al intentar registrar al médico.";
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
                    value={doctorData.firstName}
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
                    value={doctorData.lastName}
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
                    value={doctorData.dni}
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
                    value={doctorData.profile}
                    disable={true}
                    size="small"
                />

                <Input
                    tittle="Teléfono"
                    name="telephone"
                    type="tel"
                    value={doctorData.telephone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.telephone}
                    size="small"
                    required
                    disable={isLoading}
                />

                <div className="col-start-3 col-span-2">
                    <Input
                        tittle="Correo Electrónico"
                        name="email"
                        type="email"
                        value={doctorData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.email}
                        size="small"
                        required
                        disable={isLoading}
                    />
                </div>

                <Input
                    tittle="Matrícula"
                    name="licenseNumber"
                    value={doctorData.licenseNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.licenseNumber}
                    size="small"
                    required
                    disable={isLoading}
                />



                <Select
                    tittle="Especialidad"
                    name="specialtyId"
                    value={doctorData.specialtyId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.specialtyId}
                    options={specialtyOptions}
                    placeholder="Seleccione una especialidad..."
                    size="small"
                    required
                    disable={isLoading}
                />

                <div className="col-span-4 flex justify-center mt-6">
                    <Button
                        text="Guardar Médico en el Sistema"
                        variant="primary"
                        type="submit"
                        size="big"
                        isLoading={isLoading} // Spinner en el botón
                    />
                </div>

            </form>
        </div>
    );
};

export default AdminNewDoctor;