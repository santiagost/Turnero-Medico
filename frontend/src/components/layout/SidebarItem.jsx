import React from 'react';
import { NavLink } from 'react-router-dom';

const SidebarItem = ({ label, icon, path }) => {
    return (
        <NavLink
            to={path}

            className={({ isActive }) =>
                `
                flex flex-col items-center justify-center 
                font-semibold text-md
                transition-all duration-300
                px-4
                
                ${isActive
                    // Estilo ACTIVO (como "Inicio")
                    ? `bg-custom-blue text-custom-dark-blue 
                           shadow-md rounded-r-2xl
                           w-[7vw] py-2
                           z-10`

                    // Estilo INACTIVO (como "Agenda")
                    : `text-custom-dark-blue py-2 m-1 hover:bg-custom-mid-light-blue hover:rounded-xl`
                }
                `
            }
        >
            {({ isActive }) => (
                <>
                    {icon}
                    {isActive && <span className="mt-1">{label}</span>}
                </>
            )}
        </NavLink>
    );
};

export default SidebarItem;

