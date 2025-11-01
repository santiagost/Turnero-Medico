import React from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorDisplay from '../../components/ui/ErrorDisplay';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  }
  
  return (
    <div>
      <div className="flex flex-row gap-2 items-center ml-4">
        <img
          className="w-14 m-2 p-1 rounded-full shadow-2xl hover:scale-110 transition-transform duration-200 cursor-pointer"
          src="/icono.png"
          onClick={handleGoHome}
          alt="Logo" />
        <h1
          className="font-black text-custom-dark-blue cursor-pointer"
          onClick={handleGoHome}
        >
          VITALIS CENTRO MÉDICO
        </h1>
      </div>

      <ErrorDisplay errorCode="404" title="Página No Encontrada" subtitle="No se pudo encontrar la página que estás buscando." />
    </div>
  );
};

export default NotFoundPage;
