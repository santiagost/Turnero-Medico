import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import AnimatedPage from '../../components/layout/AnimatedPage';
import PrincipalCard from '../../components/ui/PrincipalCard';


const LoginPage = () => {
    const { login, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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

    const loginContent = (
        <div className='flex flex-col items-center justify-center space-y-4'>
            <button
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
            </button>
            <button
                onClick={habldeToRegister}
                className='bg-custom-light-blue text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200'
            >
                Registrarse
            </button>
        </div>
    );

    return (
        <div className='relative min-h-screen w-full overflow-hidden'>
            <img
                src="/fondo.svg"
                className="absolute top-0 left-0 w-full object-fill z-10"
                alt="Fondo decorativo de inicio de sesión"
            />
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

