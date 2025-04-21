import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <Container className="text-center mt-5">
            <Row>
                <Col>
                    <h1>404</h1>
                    <h2>Página No Encontrada</h2>
                    <p>Lo sentimos, la página que buscas no existe o ha sido movida.</p>
                    <Button as={Link} to="/" variant="primary">Volver al Inicio</Button>
                </Col>
            </Row>
        </Container>
    );
};

export default NotFoundPage;