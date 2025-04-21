// frontend/src/routes/AppRouter.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout Components
import AppNavbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// Page Components
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import AccountsPage from '../pages/AccountsPage';
import AccountDetailPage from '../pages/AccountDetailPage';
import LoansPage from '../pages/LoansPage';
import LoanDetailPage from '../pages/LoanDetailPage';
import CardsPage from '../pages/CardsPage';
import CardDetailPage from '../pages/CardDetailPage'; // <<< IMPORTAR CardDetailPage
import NotFoundPage from '../pages/NotFoundPage';

// Route Protector
import ProtectedRoute from './ProtectedRoute';


const AppRouter = () => {
    return (
        // Flex para asegurar que el footer quede abajo en páginas cortas
        <div className="d-flex flex-column min-vh-100">
            <AppNavbar />
            {/* Contenedor principal con padding y capacidad de crecer */}
            <main className="container flex-grow-1 main-container">
                <Routes>
                    {/* Rutas Públicas (accesibles sin login) */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Rutas Protegidas (requieren login) */}
                    <Route element={<ProtectedRoute />}>
                        {/* Rutas principales y dashboard */}
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />

                        {/* Sección Cuentas */}
                        <Route path="/accounts" element={<AccountsPage />} />
                        <Route path="/accounts/:id" element={<AccountDetailPage />} />

                        {/* Sección Préstamos */}
                        <Route path="/loans" element={<LoansPage />} />
                        <Route path="/loans/:id" element={<LoanDetailPage />} />

                        {/* Sección Tarjetas */}
                        <Route path="/cards" element={<CardsPage />} />
                        <Route path="/cards/:id" element={<CardDetailPage />} /> {/* <<< RUTA AÑADIDA */}
                    </Route>

                    {/* Ruta comodín para páginas no encontradas (404) */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
};

export default AppRouter;