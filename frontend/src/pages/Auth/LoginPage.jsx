import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

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

    return (
        <div className='flex items-center justify-center flex-col min-h-screen'>
            <h2 className='text-2xl font-bold mb-4'>Página de Login (Simulación)</h2>
            <p className='mb-6'>Selecciona un rol para simular el inicio de sesión:</p>
            <div className='flex gap-4'>
                <button
                    className='bg-blue-200 hover:bg-blue-300 p-4 rounded-2xl'
                    onClick={() => handleLogin('Patient')}
                >
                    Entrar como Paciente
                </button>
                <button
                    className='bg-green-200 hover:bg-green-300 p-4 rounded-2xl'
                    onClick={() => handleLogin('Doctor')}
                >
                    Entrar como Médico
                </button>
                <button
                    className='bg-purple-200 hover:bg-purple-300 p-4 rounded-2xl'
                    onClick={() => handleLogin('Admin')}
                >
                    Entrar como Admin
                </button>
            </div>
        </div>
    );
};

export default LoginPage;

