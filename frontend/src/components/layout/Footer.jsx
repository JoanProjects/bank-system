import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-light text-center text-lg-start mt-auto"> {/* mt-auto empuja al fondo si el contenido es corto */}
            <Container className="p-4">
                <p className="text-center mb-0">
                    © {new Date().getFullYear()} Mi Banco App. Todos los derechos reservados.
                </p>
            </Container>
        </footer>
    );
};

export default Footer;