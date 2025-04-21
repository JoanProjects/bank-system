import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Card } from 'react-bootstrap';

const DashboardPage = () => {
    const { user } = useAuth();

    return (
        <Container>
            <Row>
                <Col>
                    <h1>Bienvenido, {user?.name || 'Usuario'}!</h1>
                    <p>Este es tu panel de control bancario.</p>
                    {/* Aquí puedes empezar a añadir resúmenes */}
                    {/* Ejemplo: */}
                    {/* <Row>
                        <Col md={4}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Saldo Total Cuentas</Card.Title>
                                    <Card.Text>
                                        {/* Lógica para obtener y mostrar saldo total *}
                                        $1,234.56
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                         <Col md={4}>
                            <Card>
                                 <Card.Body>
                                    <Card.Title>Próximo Pago Préstamo</Card.Title>
                                    <Card.Text>
                                        15 de Julio - $250.00
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row> */}
                </Col>
            </Row>
        </Container>
    );
};

export default DashboardPage;