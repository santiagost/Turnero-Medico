import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';

// Importa los componentes y el nuevo esquema
import PrincipalCard from '../../components/ui/PrincipalCard';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { forgotPasswordValidationSchema } from '../../validations/authSchemas';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const toast = useToast();

    // --- Estado (solo email) ---
    const [formData, setFormData] = useState({
        email: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        const isValid = validateForm();

        if (isValid) {
            setLoading(true);
            console.log("Email para recuperar:", formData.email);

            try {
                // AQUI VA LA LLAMADA AL BACKEND                
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Para probar error descomenta esta línea:
                // await new Promise((_, reject) => setTimeout(() => reject({ response: { data: { message: "El correo no existe" } } }), 2000));

                toast.success("¡Correo enviado! Revisa tu bandeja de entrada.");
                setTimeout(() => {
                    handleToLogin();
                }, 2000);

            } catch (error) {
                console.error(error);
                if (error.response?.data?.message) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error("Hubo un error al enviar la solicitud.");
                }
            } finally {
                setLoading(false);
            }

        } else {
            toast.warning("Por favor, ingresa un correo válido.");
            console.log("Formulario inválido:", errors);
        }
    };

    const forgotPasswordContent = (
        <form
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
                    isLoading={loading}
                />
                <Button
                    text={"Volver"}
                    variant={"secondary"}
                    type={"button"}
                    onClick={handleToLogin}
                    disable={loading}
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