import React, { useState, useEffect } from 'react';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import Button from '../../../ui/Button';
import { useToast } from '../../../../hooks/useToast';
import Spinner from '../../../ui/Spinner';

import { adminCreatePatientSchema } from '../../../../validations/adminSchemas';
import ROLES from '../../../../utils/constants';

import { getSocialWorkOptions } from '../../../../../services/socialWork.service';
import { getPatientById } from '../../../../../services/patient.service';

// 2. Define el estado inicial para Paciente
const initialPatientState = {
    firstName: "",
    lastName: "",
    dni: "",
    role: `${ROLES["Patient"]}`,
    telephone: "",
    birthDate: "",
    email: "",
    membershipNumber: "",
    socialWorkId: ""
};

const AdminEditPatient = ({ patientId, onSave, onCancel }) => {
    const [patientData, setPatientData] = useState(initialPatientState);
    const [errors, setErrors] = useState({});
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(true);

    const [socialWorksOptionsWithEmpty, setSocialWorkOptions] = useState([
        { value: "", label: "" }
    ]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const dataFromBackend = await getSocialWorkOptions();

                setSocialWorkOptions([
                    ...dataFromBackend
                ]);
            } catch (error) {
                console.error("No se pudieron cargar las opciones", error);
            }
        };

        fetchOptions();
    }, []);

    const isParticularSelected = () => {
        const selected = socialWorksOptionsWithEmpty.find(opt => opt.value == patientData.socialWorkId);
        return selected && selected.label === "Particular";
    };

    const getParticularId = () => {
        const particularOption = socialWorksOptionsWithEmpty.find(opt => opt.label === "Particular");
        return particularOption ? particularOption.value : null;
    };

    useEffect(() => {
        const fetchPatientData = async () => {
            if (!patientId) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const data = await getPatientById(patientId); 

                setPatientData({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    dni: data.dni,
                    role: ROLES["Patient"], // Mantener el rol estático
                    telephone: data.telephone,
                    birthDate: data.birthDate,
                    email: data.user ? data.user.email : "", // Acceso seguro al email
                    membershipNumber: data.membershipNumber || "",
                    socialWorkId: data.socialWork ? data.socialWork.socialWorkId : "" // Acceso seguro al ID
                });

            } catch (error) {
                console.error("Error cargando paciente:", error);
                toast.error("No se pudo cargar la información del paciente.");
                if (onCancel) onCancel(); 

            } finally {
                setIsLoading(false);
            }
        };

        fetchPatientData();
    }, [patientId]);

    // --- Handlers (usando el esquema de Paciente) ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPatientData(prev => {
            const newData = { ...prev, [name]: value };

            if (name === "socialWorkId") {
                const selectedOption = socialWorksOptionsWithEmpty.find(opt => opt.value == value);

                if (selectedOption && selectedOption.label === "Particular") {
                    newData.membershipNumber = "";
                }
            }
            return newData;
        });
        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const particularId = getParticularId();
        const schema = adminCreatePatientSchema(particularId);

        const rule = schema[name];
        if (rule) {
            const error = rule(value, patientData);
            setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        const particularId = getParticularId();
        const schema = adminCreatePatientSchema(particularId);

        for (const name in schema) {
            const value = patientData[name];
            const rule = schema[name];
            const error = rule(value, patientData);
            if (error) { newErrors[name] = error; }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = validateForm();

        if (!isValid) {
            toast.warning("Por favor, corrige los errores en el formulario antes de guardar.");
            return;
        }

        if (onSave) {
            onSave(patientData);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-10 h-64">
                <Spinner />
            </div>
        );
    }

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
                    name="role"
                    value={patientData.role}
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
                    D onBlur={handleBlur}
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
                    error={errors.membershipNumber}
                    size="small"
                    disable={isParticularSelected()}
                    placeholder={isParticularSelected() ? "No requerido" : ""}
                />
                <Select
                    img tittle="Obra Social"
                    name="socialWorkId"
                    value={patientData.socialWorkId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.socialWorkId}
                    options={socialWorksOptionsWithEmpty}
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