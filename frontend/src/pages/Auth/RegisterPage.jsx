import React from 'react';
import PrincipalCard from '../../components/ui/PrincipalCard';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../../components/layout/AnimatedPage';

const RegisterPage = () => {
  const navigate = useNavigate();

  const habdleToLogin = () => {
    navigate("/")
  }

  const registerContent = (
    <div className='flex flex-col items-center justify-center space-y-4'>
      <button
        className='bg-custom-light-blue text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200'
      >
        Crear Paciente
      </button>

      <button
        className='bg-custom-light-blue text-white py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200'
        onClick={habdleToLogin}
      >
        Volver
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
        <div className='flex flex-col items-center justify-center bg-white py-25 px-35 rounded-full'>
          <img
            className="w-120 m-2 p-1"
            src="/icono.png"
            alt="Logo" />
          <h1 className='text-4xl font-extrabold text-custom-dark-blue text-center'>
            VITALIS CENTRO <br /> MÉDICO
          </h1>
        </div>
        <div className='flex flex-col items-center justify-center w-full'>
          <PrincipalCard title="Crear Perfil" content={registerContent} />
        </div>

      </div>

    </div>

  );
};

export default RegisterPage;
