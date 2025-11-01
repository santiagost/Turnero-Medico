import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Empieza cargando

    // Este useEffect se ejecuta UNA VEZ al cargar la app
    useEffect(() => {
        try {
            // 1. Intenta leer el usuario desde localStorage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                // 2. Si existe, lo cargamos en el estado
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Error al cargar usuario desde localStorage", error);
            setUser(null); // Si hay error, no hay usuario
        } finally {
            // 3. (Importante) Pase lo que pase, terminamos de cargar
            setIsLoading(false);
        }
    }, []); // El array vacío [] asegura que solo se ejecute al inicio

    const login = (role) => {
        const mockUserData = {
            role: role,
            name: 'Usuario de Prueba'
        };
        // 4. Guardar en localStorage
        localStorage.setItem('user', JSON.stringify(mockUserData));
        // 5. Guardar en el estado
        setUser(mockUserData);
    };

    const logout = () => {
        // 6. Borrar de localStorage
        localStorage.removeItem('user');
        // 7. Borrar del estado
        setUser(null);
        // Opcional: redirigir a /login
        // window.location.href = '/#/'; // Redirigir a la raíz del hash router
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

