// frontend/src/pages/AccountsPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import accountApi from '../api/accountApi';
import AccountSummaryCard from '../components/specific/AccountSummaryCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';

const AccountsPage = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para el Modal de Crear Cuenta
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAccountType, setNewAccountType] = useState('ahorro');
    const [creatingAccount, setCreatingAccount] = useState(false);
    const [createError, setCreateError] = useState(null);

    // Función para cargar las cuentas
    const fetchAccounts = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await accountApi.getAccounts();
            setAccounts(data);
        } catch (err) {
            setError(err.message || 'Error al cargar las cuentas.');
        } finally {
            setLoading(false);
        }
    };

    // Cargar cuentas al montar el componente
    useEffect(() => {
        fetchAccounts();
    }, []);

    // Manejadores del Modal
    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setNewAccountType('ahorro'); // Resetear
        setCreateError(null); // Limpiar error del modal
    };
    const handleShowCreateModal = () => setShowCreateModal(true);

    // Manejador para crear la cuenta
    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setCreatingAccount(true);
        setCreateError(null);
        try {
            await accountApi.createAccount({ accountType: newAccountType });
            handleCloseCreateModal();
            fetchAccounts(); // Recargar la lista de cuentas
            // Podrías mostrar un mensaje de éxito temporal si quieres
        } catch (err) {
            setCreateError(err.message || 'No se pudo crear la cuenta.');
        } finally {
            setCreatingAccount(false);
        }
    };

    return (
        <Container>
            <Row className="align-items-center mb-4">
                <Col>
                    <h1>Mis Cuentas</h1>
                </Col>
                <Col xs="auto">
                    <Button variant="success" onClick={handleShowCreateModal}>
                        + Crear Nueva Cuenta
                    </Button>
                </Col>
            </Row>

            {loading && <LoadingSpinner />}
            {error && <AlertMessage variant="danger">{error}</AlertMessage>}

            {!loading && !error && (
                accounts.length === 0 ? (
                    <AlertMessage variant="info">Aún no tienes cuentas creadas.</AlertMessage>
                ) : (
                    <Row>
                        {accounts.map(account => (
                            <Col md={6} lg={4} key={account._id} className="mb-3">
                                <AccountSummaryCard account={account} />
                            </Col>
                        ))}
                    </Row>
                )
            )}

            {/* Modal para Crear Cuenta */}
            <Modal show={showCreateModal} onHide={handleCloseCreateModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Nueva Cuenta</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateAccount}>
                    <Modal.Body>
                        {createError && <Alert variant="danger">{createError}</Alert>}
                        <Form.Group controlId="accountTypeSelect">
                            <Form.Label>Tipo de Cuenta</Form.Label>
                            <Form.Select
                                value={newAccountType}
                                onChange={(e) => setNewAccountType(e.target.value)}
                                disabled={creatingAccount}
                            >
                                <option value="ahorro">Ahorro</option>
                                <option value="corriente">Corriente</option>
                            </Form.Select>
                        </Form.Group>
                        {/* Podrías añadir un campo para depósito inicial si el backend lo soporta */}
                        {/* <Form.Group className="mt-3" controlId="initialDeposit">
                            <Form.Label>Depósito Inicial (Opcional)</Form.Label>
                            <Form.Control type="number" min="0" step="0.01" placeholder="0.00" />
                        </Form.Group> */}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseCreateModal} disabled={creatingAccount}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={creatingAccount}>
                            {creatingAccount ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/> Creando...
                                </>
                            ) : (
                                'Crear Cuenta'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default AccountsPage;