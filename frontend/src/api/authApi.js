import axiosInstance from './axiosConfig'; // Usar la instancia configurada

const API_URL = '/auth'; // Relativo a la baseURL /api

const register = async (name, email, password) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/register`, { name, email, password });
        // Guardar en localStorage inmediatamente después del registro exitoso si el backend devuelve token
        if (response.data && response.data.token) {
            localStorage.setItem('userInfo', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        // Lanzar el error para que el componente lo maneje
        throw error.response?.data?.message || error.message || 'Error en el registro';
    }
};

const login = async (email, password) => {
     try {
        const response = await axiosInstance.post(`${API_URL}/login`, { email, password });
         // Guardar en localStorage inmediatamente después del login exitoso
        if (response.data && response.data.token) {
            localStorage.setItem('userInfo', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || error.message || 'Error en el inicio de sesión';
    }
};

const logout = () => {
    // Simplemente remover la info del usuario de localStorage
    localStorage.removeItem('userInfo');
    // Podríamos añadir una llamada al backend si hubiera que invalidar el token allí
};

export default {
    register,
    login,
    logout,
};