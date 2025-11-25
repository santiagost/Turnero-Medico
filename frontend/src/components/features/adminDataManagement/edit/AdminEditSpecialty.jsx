import React, { useState, useEffect } from 'react';
import Input from '../../../ui/Input';
import Button from '../../../ui/Button';
import { useToast } from '../../../../hooks/useToast';
import Spinner from '../../../ui/Spinner';
import { adminCreateSpecialtySchema } from '../../../../validations/adminSchemas';
import { getSpecialtyById } from '../../../../../services/specialty.service';

// 2. Define el estado inicial para Especialidad
const initialSpecialtyState = {
    name: "",
    description: ""
};

const AdminEditSpecialty = ({ specialtyId, onSave, onCancel }) => {
    const [specialtyData, setSpecialtyData] = useState(initialSpecialtyState);
    const [errors, setErrors] = useState({});
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSpecialtyData = async () => {
            try {
                setIsLoading(true);
                const data = await getSpecialtyById(specialtyId);
                setSpecialtyData(data);

            } catch (error) {
                console.error("Error cargando especialidad:", error);
                toast.error("No se pudo cargar la información de la especialidad.");

                if (onCancel) onCancel();
                
            } finally {
                setIsLoading(false);
            }
        };

        if (specialtyId) {
            fetchSpecialtyData();
        }
    }, [specialtyId]);

    
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
            onSave(specialtyData);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
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