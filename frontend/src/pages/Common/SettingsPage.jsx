import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AnimatedPage from '../../components/layout/AnimatedPage';
import SectionCard from '../../components/ui/SectionCard';

import PersonalDataSettings from '../../components/features/setings/PersonalDataSettings';
import NotificationSettings from '../../components/features/setings/NotificationSettings';
import SecuritySettings from '../../components/features/setings/SecuritySettings';


const SettingsPage = () => {
    const { user } = useAuth();

    if (!user) {
        return <div>Cargando configuración...</div>;
    }

    return (
        <AnimatedPage>
            <div className="px-8">
                <h1 className="text-2xl font-bold text-custom-dark-blue mb-6">
                    Configuración
                </h1>
                <div className='grid grid-cols-2'>

                    <div className='col-start-1 col-span-1 flex flex-col justify-center'>
                        <SectionCard
                            tittle={"Mis Datos"}
                            content={<PersonalDataSettings />}
                        />
                    </div>
                    <div className='col-start-2 col-span-1 flex flex-col justify-center'>
                        <SectionCard
                            tittle={"Notificaciones"}
                            content={<NotificationSettings user={user} />}
                        />
                        <SectionCard
                            tittle={"Seguridad"}
                            content={<SecuritySettings />}
                        />
                    </div>

                </div>
            </div>
        </AnimatedPage>
    );
};

export default SettingsPage;