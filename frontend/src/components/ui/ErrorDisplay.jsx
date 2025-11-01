import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";

const ErrorDisplay = ({ errorCode, title, subtitle, homePath = "/" }) => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate(homePath);
    };

    return (
        <div className="flex items-center justify-center">
            <div className="bg-custom-blue w-200 h-200 max-w-full rounded-full flex items-center justify-center">                
                <div className="bg-white w-5/6 h-4/6 rounded-3xl shadow-lg shadow-custom-dark-blue p-8 flex flex-col items-center justify-center">
                    {/* Código de Error */}
                    <h1 className="text-9xl font-black text-custom-dark-blue">{errorCode}</h1>
                    {/* Titulo */}
                    <h2 className="text-3xl font-bold text-custom-dark-blue mt-4 text-center">{title}</h2>
                    {/* Subtítulo */}
                    <p className="text-custom-gray text-center mt-4">{subtitle}</p>
                    
                    {/* Botón/Enlace "Ir al Inicio" */}
                    <button
                        onClick={handleGoHome}
                        className="flex items-center justify-center gap-2 text-custom-dark-blue font-bold mt-10 hover:bg-custom-light-blue hover:scale-110 px-6 py-3 rounded-full transition duration-200"
                    >
                        <span>Ir al Inicio</span><FaArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorDisplay;
