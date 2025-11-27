import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import SidebarItem from './SidebarItem';


import { GoHome, GoFile } from "react-icons/go"; // Icono Home y Reportes
import { FiBookOpen } from "react-icons/fi"; // Icono Historial
import { FaRegCalendar } from "react-icons/fa6"; // Icono Calendario
import { PiHandHeart } from "react-icons/pi"; // Icono Pacientes
import { BsThreeDots } from "react-icons/bs"; // Icono Otros
import { FaUserDoctor } from "react-icons/fa6"; // Icono Médicos
import { IoSettingsOutline } from "react-icons/io5"; // Icono Configuración


const navLinks = {
    Patient: {
        main: [
            { label: 'Inicio', icon: <GoHome size={45} />, path: '/patient/home' },
            { label: 'Agenda', icon: <FaRegCalendar size={45} />, path: '/patient/schedule' },
            { label: 'Historial', icon: <FiBookOpen size={45} />, path: '/patient/history' },
        ],
        bottom: [
            { label: 'Config.', icon: <IoSettingsOutline size={45} />, path: '/patient/settings' },
        ]
    },
    Doctor: {
        main: [
            { label: 'Inicio', icon: <GoHome size={45} />, path: '/doctor/home' },
            { label: 'Pacientes', icon: <PiHandHeart size={45} />, path: '/doctor/patients' },
            { label: 'Horarios', icon: <FaRegCalendar size={45} />, path: '/doctor/schedule' },
        ],
        bottom: [
            { label: 'Config.', icon: <IoSettingsOutline size={45} />, path: '/doctor/settings' },
        ]
    },
    Admin: {
        main: [
            { label: 'Inicio', icon: <GoHome size={45} />, path: '/admin/home' },
            { label: 'Agendas', icon: <FaRegCalendar size={45} />, path: '/admin/schedule' },
            { label: 'Médicos', icon: <FaUserDoctor size={45} />, path: '/admin/doctors' },
            { label: 'Pacientes', icon: <PiHandHeart size={45} />, path: '/admin/patients' },
            { label: 'Reportes', icon: <GoFile size={45} />, path: '/admin/reports' },
            { label: 'Otros', icon: <BsThreeDots size={45} />, path: '/admin/others' },
        ],
        bottom: [
            { label: 'Config.', icon: <IoSettingsOutline size={45} />, path: '/admin/settings' },
        ]
    }
};

const Sidebar = () => {
    // Obtiene el usuario actual para determinar los enlaces a mostrar
    const { user } = useAuth();
    // Selecciona los enlaces según el rol del usuario
    const links = user ? navLinks[user.role] : { main: [], bottom: [] };

    return (
        <div className='bg-transparent h-screen w-[6vw] flex flex-col my-15'>
            <aside className="bg-custom-light-blue py-5 shadow-lg rounded-r-4xl w-full">
                <nav
                    className="flex flex-col gap-4">
                    {links?.main.map((link) => (
                        <div key={link.path}>
                            <SidebarItem
                                label={link.label}
                                icon={link.icon}
                                path={link.path}
                            />
                            <hr className='border-t border-white mx-4' />
                        </div>
                    ))}
                </nav>

                <nav
                    className="flex flex-col gap-4">
                    {links?.bottom.map((link) => (
                        <SidebarItem
                            key={link.path}
                            label={link.label}
                            icon={link.icon}
                            path={link.path}
                        />
                    ))}
                </nav>
            </aside>
        </div>
    );
};

export default Sidebar;
