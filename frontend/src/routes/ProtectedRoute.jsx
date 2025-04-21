import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from 'react-bootstrap'; // Para mostrar carga

const ProtectedRoute = ({ children }) => { // children no se usa con <Outlet/>
    const { user, loading } = useAuth();

    if (loading) {
        // Mostrar un spinner mientras se verifica la autenticación inicial
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
            </div>
        );
    }

    // Si no está cargando y no hay usuario, redirigir a login
    if (!user) {
        // replace: true evita que el usuario pueda volver a la ruta protegida con el botón "atrás" del navegador
        return <Navigate to="/login" replace />;
    }

    // Si el usuario está autenticado, renderizar el componente hijo solicitado (a través de Outlet)
    return <Outlet />;
    // Alternativamente, si se pasara 'children': return children;
};

export default ProtectedRoute;