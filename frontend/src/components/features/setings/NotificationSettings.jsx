import React from 'react';
import ToggleSwitch from '../../ui/ToggleSwitch';

const NotificationSettings = ({ user }) => {
    switch (user.role) {
        case 'Patient':
            return (
                <div className='m-6 text-custom-dark-blue'>
                    <h1 className='font-bold text-lg'>Recordatorio de Turnos</h1>

                    <div className='px-4 py-2 gap-y-2 flex flex-col'>
                        <div className='flex flex-row items-center justify-between px-2'>
                            <li>Recordarme 24 horas antes de mi turno</li> <ToggleSwitch/>
                        </div>
                        <div className='flex flex-row items-center justify-between px-2'>
                            <li>Enviar notificación a mi correo electrónico</li>
                            <ToggleSwitch/>
                        </div>
                    </div>
                </div>
            )
        case 'Doctor':
            return (
                <div className='m-6 text-custom-dark-blue'>
                    <h1 className='font-bold text-lg'>Alerta de Agenta</h1>

                    <div className='px-4 py-2 gap-y-2 flex flex-col'>
                        <div className='flex flex-row items-center justify-between px-2'>
                            <li>Notificarme cuando se reserva un nuevo turno</li> <ToggleSwitch/>
                        </div>
                        <div className='flex flex-row items-center justify-between px-2'>
                            <li>Notificarme cuando un paciente cancela un turno</li>
                            <ToggleSwitch/>
                        </div>
                    </div>
                </div>
            )
        case 'Admin':
            return (
                <div className='m-6 text-custom-dark-blue'>
                    <h1 className='font-bold text-lg'>Reportes y Errores</h1>

                    <div className='px-4 py-2 gap-y-2 flex flex-col'>
                        <div className='flex flex-row items-center justify-between px-2'>
                            <li>Notificarme sobre registros fallidos</li> <ToggleSwitch/>
                        </div>
                        <div className='flex flex-row items-center justify-between px-2'>
                            <li>Enviar reporte de turnos diarios a mi correo electrónico</li>
                            <ToggleSwitch/>
                        </div>
                    </div>
                </div>
            )
        default:
            return (
                <div>Rol de usuario no reconocido.</div>
            )
    }
};

export default NotificationSettings;