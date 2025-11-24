import React, { useState } from 'react';
import Input from '../../../ui/Input';
import Button from '../../../ui/Button';
import { useToast } from '../../../../hooks/useToast';
import { adminCreateSpecialtySchema } from '../../../../validations/adminSchemas';

const initialSpecialtyState = {
    name: "",
    description: ""
};

const AdminNewSpecialty = () => {
    const [specialtyData, setSpecialtyData] = useState(initialSpecialtyState);
    const [errors, setErrors] = useState({});
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isValid = validateForm();

        if (!isValid) {
            toast.warning("Por favor, completa todos los campos correctamente.");
            return;
        }

        setIsLoading(true); // Activar spinner

        try {
            // AQUI VA LA LLAMADA AL BACKEND
            // await axios.post('/api/specialties', specialtyData);

            // Simulación de espera
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log("Datos de la nueva Especialidad a guardar:", specialtyData);

            toast.success("Especialidad guardada exitosamente.");

            // Limpiar formulario
            setSpecialtyData(initialSpecialtyState);
            setErrors({});

        } catch (error) {
            console.error("Error al crear especialidad:", error);
            toast.error("Ocurrió un error al guardar la especialidad.");
        } finally {
            setIsLoading(false); // Desactivar spinner
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
                    disable={isLoading}
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
                        disable={isLoading}
                    />
                </div>

                <div className="col-start-1 col-span-4 flex justify-center items-center">
                    <Button
                        text="Guardar Especialidad en el Sistema"
                        variant="primary"
                        type="submit"
                        size="big"
                        isLoading={isLoading}
                    />
                </div>

            </form>
        </div>
    );
};

export default AdminNewSpecialty;