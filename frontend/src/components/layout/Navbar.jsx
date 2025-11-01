import React, { useState, useRef } from 'react';
import { IoMdNotificationsOutline, IoMdMenu } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useClickOutside } from '../../hooks/useClickOutside';
import ROLES from '../../utils/utilities';


const MenuDropdown = ({ user, onLogout, onGoToProfile }) => {
    return (
        <div className="absolute top-16 right-4 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-2">
                <p className="font-bold px-2 py-1 text-custom-dark-blue truncate">
                    {user?.name || 'Usuario'}
                </p>
                <p className="text-xs px-2 text-gray-500 truncate">
                    Rol: {ROLES[user?.role] || '...'}
                </p>

                <hr className="my-2" />

                <Link to={onGoToProfile}
                    className="block w-full text-left px-4 py-2 rounded-md text-custom-dark-blue hover:bg-custom-mid-gray/25">
                    Mi Perfil
                </Link>
                <button
                    onClick={onLogout}
                    className="block w-full text-left px-4 py-2 rounded-md text-custom-red hover:bg-custom-red/15"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

// Aca agregare en algun momento las notificaciones reales que tiene asociado un usuario
const NotificationDropdown = () => {
    return (
        <div className="absolute top-16 right-16 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-2">
                <div className="flex justify-between items-center mb-2">
                    <p className="font-bold px-2 py-1 text-custom-dark-blue">
                        Notificaciones
                    </p>
                    <span className="text-xs text-gray-500 px-2">
                        Marcar todo como leído
                    </span>
                </div>

                <hr className="my-2" />

                <div className="max-h-80 overflow-y-auto">
                    {/* Si no hay notificaciones */}
                    <p className="text-center text-gray-500 py-4">
                        No tienes notificaciones nuevas
                    </p>

                    {/* Ejemplo de notificación */}
                    {/* 
                    <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm text-custom-dark-blue">
                            Tienes una nueva cita médica
                        </p>
                        <p className="text-xs text-gray-500">
                            Hace 5 minutos
                        </p>
                    </div>
                    */}
                </div>
            </div>
        </div>
    );
};



const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const menuRef = useRef(null);
    // Click fuera cierra ambos dropdowns
    useClickOutside(menuRef, () => {
        setIsMenuOpen(false);
        setIsNotifOpen(false);
    });

    const handleGoHome = () => {
        if (!user) {
            navigate('/');
            return;
        }
        const homePath = {
            'Admin': '/admin/home',
            'Doctor': '/doctor/home',
            'Patient': '/patient/home'
        };
        navigate(homePath[user.role] || '/');
    };

    const handleNotifications = () => {
        setIsNotifOpen(prev => {
            const next = !prev;
            if (next) setIsMenuOpen(false); // cerrar menu si abrimos notifs
            return next;
        });
    };

    const handleMenuToggle = () => {
        setIsMenuOpen(prev => {
            const next = !prev;
            if (next) setIsNotifOpen(false); // cerrar notifs si abrimos menu
            return next;
        });
    };

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        navigate('/');
    };

    const profilePath = {
        'Admin': '/admin/settings',
        'Doctor': '/doctor/settings',
        'Patient': '/patient/settings'
    };
    const goToProfile = user ? profilePath[user.role] : '/';


    return (
        <nav className="bg-white flex flex-row items-center justify-between p-1 shadow-md shadow-custom-light-blue text-custom-dark-blue">

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

            <div ref={menuRef} className="relative flex flex-row gap-6 items-center mr-4">
                <IoMdNotificationsOutline
                    size={40}
                    className="hover:scale-110 transition-transform duration-200 cursor-pointer"
                    onClick={handleNotifications}
                />
                <IoMdMenu
                    size={40}
                    className="hover:scale-110 transition-transform duration-200 cursor-pointer"
                    onClick={handleMenuToggle}
                />

                {isNotifOpen && (
                    <NotificationDropdown />
                )}

                {isMenuOpen && (
                    <MenuDropdown
                        user={user}
                        onLogout={handleLogout}
                        onGoToProfile={goToProfile}
                    />
                )}
            </div>
        </nav>
    );
};

export default Navbar;
