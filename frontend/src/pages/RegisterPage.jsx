import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 
import { Container, Form, Button, Alert, Row, Col, Card, Spinner } from 'react-bootstrap';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Las contraseñas no coinciden');
        }
        setError('');
        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/'); // Redirigir al dashboard después del registro exitoso
        } catch (err) {
            setError(err.message || 'Error al registrarse. Intenta de nuevo.');
             setLoading(false);
        }
         // setLoading(false); // Ya se maneja en el catch
    };

    return (
         <Container className="mt-5">
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4">Crear Cuenta</h2>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                 <Form.Group className="mb-3" controlId="formBasicName">
                                    <Form.Label>Nombre Completo</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ingresa tu nombre"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicEmailReg">
                                    <Form.Label>Correo Electrónico</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Ingresa tu email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="formBasicPasswordReg">
                                    <Form.Label>Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Contraseña (mín. 6 caracteres)"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                         disabled={loading}
                                    />
                                </Form.Group>

                                 <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                                    <Form.Label>Confirmar Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Confirma tu contraseña"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        disabled={loading}
                                    />
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                                    {loading ? (
                                         <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                                            {' '}Registrando...
                                        </>
                                    ) : (
                                        'Registrarse'
                                    )}
                                </Button>
                            </Form>
                            <div className="mt-3 text-center">
                                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default RegisterPage;