import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom'; // 1. Importar hooks

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // 4. Ver si el usuario venía de otra página (ej. /mi-historial)
    // Tu ProtectedRoute guarda la ruta original en 'location.state.from'
    const from = location.state?.from || null;

    const handleLogin = (role) => {
        login(role); // Simular login como el rol seleccionado

        // 5. NAVEGAR
        if (from) {
            // Si venía de una ruta protegida, lo mandamos de vuelta allí
            navigate(from, { replace: true });
        } else {
            // Si no, lo mandamos a la "home" de su rol
            const defaultPaths = {
                'Patient': '/patient/home',
                'Doctor': '/doctor/home',
                'Admin': '/admin/home'
            };
            navigate(defaultPaths[role] || '/', { replace: true });
        }
    };

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

