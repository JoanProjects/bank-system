// frontend/src/components/layout/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const AppNavbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
            <Container>
                <Navbar.Brand as={Link} to={user ? "/" : "/login"}>Mi Banco App</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {user ? (
                            <>
                                <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
                                <Nav.Link as={Link} to="/accounts">Cuentas</Nav.Link>
                                <Nav.Link as={Link} to="/loans">Préstamos</Nav.Link> {/* <<< AÑADIR ENLACE */}
                                <Nav.Link as={Link} to="/cards">Tarjetas</Nav.Link> {/* <<< AÑADIR ENLACE */}
                                <NavDropdown title={user.name || 'Usuario'} id="basic-nav-dropdown">
                                    <NavDropdown.Item onClick={handleLogout}>
                                        Cerrar Sesión
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Iniciar Sesión</Nav.Link>
                                <Nav.Link as={Link} to="/register">Registrarse</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AppNavbar;