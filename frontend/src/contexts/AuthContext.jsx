import React, { createContext, useState, useEffect, useContext } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Para saber si estamos verificando el estado inicial

    // Efecto para cargar el usuario desde localStorage al iniciar la app
    useEffect(() => {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
            try {
                setUser(JSON.parse(storedUserInfo));
            } catch (error) {
                console.error("Error parsing stored user info:", error);
                localStorage.removeItem('userInfo'); // Limpiar si está corrupto
            }
        }
        setLoading(false); // Terminar la carga inicial
    }, []);

    // Función de login: llama a la API, actualiza el estado y localStorage
    const login = async (email, password) => {
        try {
            const userData = await authApi.login(email, password);
            setUser(userData);
            // authApi ya guarda en localStorage
            return userData;
        } catch (error) {
            console.error("Login failed in context:", error);
            setUser(null); // Asegurarse de que no hay usuario si falla
            localStorage.removeItem('userInfo');
            throw error; // Re-lanzar para el componente
        }
    };

    // Función de registro: llama a la API, actualiza estado y localStorage
    const register = async (name, email, password) => {
         try {
            const userData = await authApi.register(name, email, password);
            setUser(userData);
             // authApi ya guarda en localStorage
            return userData;
        } catch (error) {
            console.error("Register failed in context:", error);
            setUser(null);
            localStorage.removeItem('userInfo');
            throw error;
        }
    };


    // Función de logout: llama a la API (si es necesario), limpia estado y localStorage
    const logout = () => {
        authApi.logout(); // Llama a la función de logout de la API (que limpia localStorage)
        setUser(null);
        // Opcional: Redirigir aquí o dejar que el componente lo haga
    };

    // Valor proporcionado por el contexto
    const value = {
        user,
        setUser, // Exponer setUser puede ser útil en algunos casos
        loading,
        login,
        register,
        logout,
    };

    // Renderizar los hijos solo cuando la carga inicial haya terminado
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};