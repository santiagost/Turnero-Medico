import React, { useState, useEffect } from 'react';
import Input from '../../../ui/Input';
import Button from '../../../ui/Button';

// 1. Importa los mocks (asumido) y el esquema de Especialidad
import { mockSpecialties } from '../../../../utils/mockData';
import { adminCreateSpecialtySchema } from '../../../../validations/adminSchemas';

// 2. Define el estado inicial para Especialidad
const initialSpecialtyState = {
    name: "",
    description: ""
};

/**
 * Componente para EDITAR una Especialidad existente.
 * @param {number} specialtyId El ID de la especialidad a editar.
 * @param {function} onSave Función para llamar al guardar.
 * @param {function} onCancel Función para llamar al cancelar.
 */
const AdminEditSpecialty = ({ specialtyId, onSave, onCancel }) => {
    const [specialtyData, setSpecialtyData] = useState(initialSpecialtyState);
    const [errors, setErrors] = useState({});

    // 4. useEffect para cargar los datos de la Especialidad
    useEffect(() => {
        console.log("Cargando datos de la Especialidad ID:", specialtyId);

        // Simulación con Mocks (asegúrate de que mockSpecialties exista y tenga specialtyId)
        if (mockSpecialties) {
            const specialty = mockSpecialties.find(s => s.specialtyId === specialtyId);

            if (specialty) {
                setSpecialtyData({
                    name: specialty.name,
                    description: specialty.description
                });
            }
        }
    }, [specialtyId]);

    // --- Handlers (usando el esquema de Especialidad) ---
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
            console.log("Datos de la Especialidad a actualizar:", specialtyData);

            if (onSave) {
                onSave(specialtyData);
            }
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="p-4 rounded-lg shadow-sm">
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

                {/* Botones de Guardar y Cancelar (igual que en AdminEditSocialWork) */}
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

export default AdminEditSpecialty;