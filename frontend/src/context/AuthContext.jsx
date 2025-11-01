import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Error al cargar usuario desde localStorage", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = (role) => {
        const mockUserData = {
            role: role,
            name: 'Usuario de Prueba'
        };
        localStorage.setItem('user', JSON.stringify(mockUserData));
        setUser(mockUserData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

