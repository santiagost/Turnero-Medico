import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-custom-dark-blue font-black">
                <h2>¿Olvidaste tu contraseña?</h2>
                <p>Ingresa tu correo electrónico y te enviaremos un link para resetear tu contraseña.</p>
            </div>
        </div>
    );
};

export default ForgotPassword;