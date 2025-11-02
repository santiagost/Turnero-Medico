import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

import PrincipalCard from '../../components/ui/PrincipalCard';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ROLES, { loginValidationSchema } from '../../utils/utilities';

import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import Button from '../../components/ui/Button';

const LoginPage = () => {
    const { login, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: ""
    })

    const [errors, setErrors] = useState({});

    const rolesOptions = Object.entries(ROLES).map(([value, label]) => ({ value, label }));

    const [showPassword, setShowPassword] = useState(false);
    const inputPassswordType = showPassword ? "text" : "password";
    const passwordIcon = showPassword ? <FaRegEyeSlash size={25} /> : <FaRegEye size={25} />;

    const handleLogin = (role) => {
        logout();
        login(role);
    };

    useEffect(() => {
        if (user) {
            const defaultPaths = {
                'Patient': '/patient/home',
                'Doctor': '/doctor/home',
                'Admin': '/admin/home'
            };
            navigate(defaultPaths[user.role] || '/', { replace: true });
        }
    }, [user, navigate, location]);

    const habldeToRegister = () => {
        navigate("/register");
    }

    const handleForgotPassword = () => {
        navigate("/forgot-password");
    }

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
        const rule = loginValidationSchema[name];
        if (rule) {
            const error = rule(value, formData);
            setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        for (const name in loginValidationSchema) {
            const value = formData[name];
            const rule = loginValidationSchema[name];
            const error = rule(value, formData);
            if (error) {
                newErrors[name] = error;
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOnSubmit = (e) => {
        e.preventDefault();

        const isValid = validateForm();

        if (isValid) {
            console.log("Datos del formulario:", formData);
            alert("¡Formulario enviado con éxito! (Revisa la consola)");

            // Aquí iría tu lógica de 'fetch' o 'axios.post' a tu API
            // Si el login es exitoso, llamas a:
            // login(userDataFromApi); // (El 'login' de tu 'useAuth')

        } else {
            console.log("Formulario inválido:", errors);
            alert("Por favor, corrige los campos.");
        }
    };

    const handleTogglePassword = () => {
        setShowPassword(prevShow => !prevShow)
    }


    const loginContent = (
        <form
            className='flex flex-col items-center justify-center h-full w-lg gap-6'
            onSubmit={handleOnSubmit}
            noValidate
        >
            <p className='text-custom-dark-blue font-regular'>¡Bienvenido/a, por favor ingrese sus datos para continuar!</p>

            <div className='flex flex-col items-center justify-center space-y-4 w-3/4'>
                <Input
                    tittle={"Correo Electrónico"}
                    type={"email"}
                    required={true}
                    name={"email"}
                    value={formData.email}
                    onChange={updateFormData}
                    onBlur={handleBlur}
                    error={errors.email}
                />

                <Input
                    tittle={"Contraseña"}
                    type={inputPassswordType}
                    icon={passwordIcon}
                    useButton={handleTogglePassword}
                    onChange={updateFormData}
                    required={true}
                    name={"password"}
                    value={formData.password}
                    onBlur={handleBlur}
                    error={errors.password}
                />

                <Select
                    tittle={"Perfil"}
                    required={true}
                    onChange={updateFormData}
                    placeholder={"Elija un Rol..."}
                    name={"role"}
                    options={rolesOptions}
                    value={formData.role}
                    onBlur={handleBlur}
                    error={errors.role}
                />

                {/* <button
                    onClick={() => handleLogin('Patient')}
                    className='bg-custom-light-blue text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200'
                >
                    Iniciar Sesión como Paciente
                </button>
                <button
                    onClick={() => handleLogin('Doctor')}
                    className='bg-custom-light-blue text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200'
                >
                    Iniciar Sesión como Doctor
                </button>
                <button
                    onClick={() => handleLogin('Admin')}
                    className='bg-custom-light-blue text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200'
                >
                    Iniciar Sesión como Administrador
                </button> */}
            </div>
            <div className='flex flex-row gap-10'>
                <Button
                    text={"Ingresar"}
                    variant={"primary"}
                    type={"submit"} />
                <Button
                    text={"Registrarse"}
                    variant={"secondary"}
                    type={"button"}
                    onClick={habldeToRegister} />
            </div>

            <p
                className='text-custom-dark-blue font-regula cursor-pointer'
                onClick={handleForgotPassword}
            >
                ¿Has olvidado tu contraseña?
            </p>
        </form>
    );

    return (
        <div className='relative min-h-screen w-full'>
            <div className='relative z-20 min-h-screen grid grid-cols-2 items-center justify-items-center p-8 gap-8'>

                <div className='flex flex-col items-center justify-center w-full'>
                    <PrincipalCard title="Iniciar Sesión" content={loginContent} />
                </div>

                <div className='flex flex-col items-center justify-center'>
                    <img
                        className="w-120 m-2 p-1"
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

export default LoginPage;

