import React, { useState, useEffect } from 'react';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import Button from '../../../ui/Button';


import { mockDoctors } from '../../../../utils/mockData';
import { adminCreateDoctorSchema } from '../../../../validations/adminSchemas';
import ROLES from '../../../../utils/constants';
import { useToast } from '../../../../hooks/useToast';

import { getSpecialtyOptions } from '../../../../../services/specialty.service';



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

const AdminEditDoctor = ({ doctorId, onSave, onCancel }) => {
    const [doctorData, setDoctorData] = useState(initialDoctorState);
    const [errors, setErrors] = useState({});
    const toast = useToast();

    const [specialtyOptions, setSpecialtyOptions] = useState([
        { value: "", label: "" }
    ]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const dataFromBackend = await getSpecialtyOptions();

                setSpecialtyOptions([
                    ...dataFromBackend
                ]);
            } catch (error) {
                console.error("No se pudieron cargar las opciones", error);
            }
        };

        fetchOptions();
    }, []);

    useEffect(() => {
        // AQUI VA LA LLAMADA AL BACKEND
        // getDoctorById(doctorId)

        console.log("Cargando datos del médico ID:", doctorId);
        const doctor = mockDoctors.find(d => d.doctorId === doctorId);

        if (doctor) {
            setDoctorData({
                firstName: doctor.firstName,
                lastName: doctor.lastName,
                dni: doctor.dni,
                profile: ROLES["Doctor"],
                telephone: doctor.telephone,
                email: doctor.user.email,
                licenseNumber: doctor.licenseNumber,
                specialtyId: doctor.specialty.specialtyId
            });
        }

    }, [doctorId]);

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
            onSave(doctorData);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="p-4 ">
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
                    D error={errors.telephone}
                    size="small"
                    required
                />
                <div className="col-start-3 col-span-2">
                    <Input
                        tittle="Correo Electrónico"
                        name="email"
                        type="email"
                        value={doctorData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        in error={errors.email}
                        size="small"
                        required
                    />
                </div>
                <Input
                    tittle="Matrícula"
                    name="licenseNumber"
                    value={doctorData.licenseNumber}
                    section onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.licenseNumber}
                    size="small"
                    required
                />
                <Select
                    tittle="Especialidad"
                    name="specialtyId"
                    value={doctorData.specialtyId}
                    Note onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.specialtyId}
                    options={specialtyOptions}
                    placeholder="Seleccione una especialidad..."
                    size="small"
                    required
                />

                <div className="col-span-4 flex justify-center mt-6 gap-10">
                    <Button
                        text="Cancelar"
                        variant="secondary"
                        type="button"
                        size="big"
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

export default AdminEditDoctor;