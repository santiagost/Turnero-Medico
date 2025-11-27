import React, { createContext, useState, useEffect } from 'react';

// Importar servicios de autenticación y perfiles
import { getPatientByUserId, getDoctorByUserId } from '../../services/auth.service'; // Asegúrate que estos servicios están aquí o en un archivo de perfil
import { mapBackendRoleToFrontend } from '../utils/mappers';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    // --- Carga Inicial desde SessionStorage ---
    useEffect(() => {
        try {
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

    // --- Lógica de Login (ASÍNCRONA) ---
    const login = async (backendResponse) => {
        const { usuario, rol } = backendResponse;

        // 1. Crear el objeto de usuario base para el estado 'user'
        const frontendUser = {
            userId: usuario.id_usuario,
            email: usuario.email,
            // Usar el mapper para convertir 'Paciente' -> 'Patient'
            role: mapBackendRoleToFrontend(rol.nombre), 
            isActive: usuario.activo,
            remindersActive: usuario.recordatorios_activados
        };

        let profileData = {};
        const userId = frontendUser.userId;
        const roleName = frontendUser.role;

        // 2. Cargar el perfil específico (Paciente/Médico)
        try {
            if (roleName === 'Patient') {
                profileData = await getPatientByUserId(userId);
            } else if (roleName === 'Doctor') {
                profileData = await getDoctorByUserId(userId);
            }
            // Para 'Admin', profileData se queda como objeto vacío {}
            
        } catch (error) {
            console.error(`Error al cargar el perfil de ${roleName} para el usuario ${userId}:`, error);
            // Si hay un error crítico al cargar el perfil, abortamos el login
            throw new Error("Login exitoso, pero el perfil asociado no fue encontrado o está desvinculado.");
        }

        // 3. Destructurar el 'user' anidado y construir el objeto 'profile' completo
        const { user: profileUser, ...patientDetails } = profileData;

        const fullProfile = {
            // Datos del usuario (ID, email, rol, etc.)
            user: frontendUser, 
            
            // Todos los detalles del perfil (firstName, lastName, patientId, etc.)
            // Sobrescribirá el campo 'user' si existiera, pero lo evitamos con la destructuración previa.
            ...patientDetails, 
            
            // Datos crudos del rol (útil si se necesita la descripción o id_rol)
            rolDB: rol 
        };

        // 4. Guardar y establecer estado
        sessionStorage.setItem('user', JSON.stringify(frontendUser));
        sessionStorage.setItem('profile', JSON.stringify(fullProfile));

        setUser(frontendUser);
        setProfile(fullProfile);

        return true;
    };

    // --- Lógica de Logout ---
    const logout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('profile');
        setUser(null);
        setProfile(null);
    };

    const updateProfileContext = (newProfileData) => {
        if (!profile) return;

        const { user: profileUser, ...updatedDetails } = newProfileData;

        const newFullProfile = {
            user: profile.user,
            rolDB: profile.rolDB, 
            ...updatedDetails
        };
        
        sessionStorage.setItem('profile', JSON.stringify(newFullProfile));
        setProfile(newFullProfile);

    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, profile, updateProfileContext }}>
            {children}
        </AuthContext.Provider>
    );
};