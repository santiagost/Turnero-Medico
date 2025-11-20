import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Importa los componentes y el nuevo esquema
import PrincipalCard from '../../components/ui/PrincipalCard';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { forgotPasswordValidationSchema } from '../../validations/authSchemas';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    // --- Estado (solo email) ---
    const [formData, setFormData] = useState({
        email: "",
    });
    const [errors, setErrors] = useState({});

    // --- Navegación ---
    const handleToLogin = () => {
        navigate("/"); // Vuelve al Login
    }

    // --- Lógica de Validación (idéntica a la que ya tienes) ---
    const updateFormData = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: null }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        // Usa el nuevo esquema de validación
        const rule = forgotPasswordValidationSchema[name]; 
        if (rule) {
            const error = rule(value, formData);
            setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        // Itera sobre el nuevo esquema
        for (const name in forgotPasswordValidationSchema) { 
            const value = formData[name];
            const rule = forgotPasswordValidationSchema[name];
            const error = rule(value, formData);
            if (error) {
                newErrors[name] = error;
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Lógica de Envío ---
    const handleOnSubmit = (e) => {
        e.preventDefault();
        const isValid = validateForm();

        if (isValid) {
            console.log("Email para recuperar:", formData.email);
            alert("¡Correo de recuperación enviado! (Revisa la consola)");
            // Aquí iría tu lógica de 'fetch' o 'axios.post' a tu API
            // ...
            // Luego, puedes redirigir al login
            navigate("/");
        } else {
            console.log("Formulario inválido:", errors);
        }
    };

    // --- Contenido del Formulario (JSX) ---
    const forgotPasswordContent = (
        <form
            // Usa 'max-w-lg' para ser consistente con LoginPage
            className='flex flex-col items-center justify-center h-full w-full max-w-lg gap-6'
            onSubmit={handleOnSubmit}
            noValidate
        >
            <p className='text-custom-dark-blue font-regular text-center'>
                Ingresa tu correo y te enviaremos un link para resetear tu contraseña.
            </p>

            <div className='flex flex-col items-center justify-center space-y-4 w-3/4'>
                <Input
                    tittle={"Correo Electrónico"}
                    type={"email"}
                    name={"email"}
                    value={formData.email}
                    onChange={updateFormData}
                    onBlur={handleBlur}
                    error={errors.email}
                />
            </div>

            <div className='flex flex-row gap-10'>
                <Button
                    text={"Enviar"}
                    variant={"primary"}
                    type={"submit"} 
                />
                <Button
                    text={"Volver"}
                    variant={"secondary"}
                    type={"button"}
                    onClick={handleToLogin} 
                />
            </div>
        </form>
    );

    // --- Layout de la Página (idéntico a LoginPage) ---
    return (
        <div className='relative min-h-screen w-full'>
            <div className='relative z-20 min-h-screen grid grid-cols-2 items-center justify-items-center p-8 gap-8'>

                {/* Columna del Formulario */}
                <div className='flex flex-col items-center justify-center w-full'>
                    <PrincipalCard title="Recuperar Contraseña" content={forgotPasswordContent} />
                </div>

                {/* Columna del Logo */}
                <div className='flex flex-col items-center justify-center'>
                    <img
                        // Nota: w-120 (480px) es grande, 'w-96' (384px) suele ser más estándar
                        className="w-96 m-2 p-1" 
                        src="/icono.png"
                        alt="Logo" />
                    <h1 className='text-4xl font-extrabold text-custom-dark-blue text-center'>
                        VITALIS CENTRO <br /> MÉDICO
                    </h1>
                </div>

            </div>
        </div>
    );
};

export default ForgotPasswordPage;