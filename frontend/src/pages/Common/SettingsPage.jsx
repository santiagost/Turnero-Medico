import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const SettingsPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Cargando configuración...</div>;
  }

  const renderSettings = () => {
    switch (user.role) {
      case 'Patient':
        return <h1>Configuración de Paciente</h1>;
      case 'Doctor':
        return <h1>Configuración de Médico</h1>;
      case 'Admin':
        return <h1>Configuración de Admin</h1>;
      default:
        return <div>Rol de usuario no reconocido.</div>;
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-custom-dark-blue mb-6">
        Configuración
      </h1>
      {renderSettings()}
    </div>
  );
};

export default SettingsPage;