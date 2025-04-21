import axios from 'axios';

// La baseURL '/api' funcionará gracias al proxy de Vite
const axiosInstance = axios.create({
    baseURL: '/api'
});

// Interceptor para añadir el token JWT a cada petición protegida
axiosInstance.interceptors.request.use(
    (config) => {
        // Obtener la info del usuario (que incluye el token) desde localStorage
        const userInfo = localStorage.getItem('userInfo')
                       ? JSON.parse(localStorage.getItem('userInfo'))
                       : null;

        // Si tenemos token, añadirlo al header Authorization
        if (userInfo && userInfo.token) {
            config.headers.Authorization = `Bearer ${userInfo.token}`;
        }
        return config; // Continuar con la petición modificada
    },
    (error) => {
        // Manejar errores de configuración de la petición
        return Promise.reject(error);
    }
);

export default axiosInstance;