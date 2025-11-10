import React, { createContext, useState, useEffect } from 'react';

import {
    mockDoctor_Sanchez,
    mockPatient_Garcia,
    mockAdmin_Diaz // (Suponiendo que creaste un mock de admin)
} from '../utils/mockData';

export const AuthContext = createContext(null);

const MOCK_USER_DB = {
    "martin.sanchez@vitalis.com": mockDoctor_Sanchez,
    "emi.garcia@gmail.com": mockPatient_Garcia,
    "agus.diaz@vitalis.com": mockAdmin_Diaz
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        try {
            // 2. Cargamos AMBOS datos desde sessionStorage
            const storedUser = sessionStorage.getItem('user');
            const storedProfile = sessionStorage.getItem('profile');

            if (storedUser && storedProfile) {
                setUser(JSON.parse(storedUser));
                setProfile(JSON.parse(storedProfile));
            }
        } catch (error) {
            console.error("Error al cargar datos desde sessionStorage", error);
            setUser(null);
            setProfile(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = (formData) => {
        const { email, role } = formData;
        const fullProfile = MOCK_USER_DB[email];
        if (fullProfile && fullProfile.user.role === role) {
            sessionStorage.setItem('user', JSON.stringify(fullProfile.user)); // Solo el objeto 'user'
            sessionStorage.setItem('profile', JSON.stringify(fullProfile)); // El perfil completo

            setUser(fullProfile.user); // Setea el 'user' anidado
            setProfile(fullProfile); // Setea el perfil completo

            return true; // Login exitoso
        }

        console.error("Login fallido: Email o Rol incorrectos.");
        return false; // Login fallido
    };

    const logout = () => {
        // 6. Limpia AMBOS
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('profile');
        setUser(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, profile }}>
            {children}
        </AuthContext.Provider>
    );
};

