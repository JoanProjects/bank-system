// frontend/src/pages/LoansPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import loanApi from '../api/loanApi';
import LoanSummaryCard from '../components/specific/LoanSummaryCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';

const LoansPage = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para Modal de Crear/Solicitar Préstamo
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loanType, setLoanType] = useState('personal');
    const [loanAmount, setLoanAmount] = useState('');
    const [loanTerm, setLoanTerm] = useState('');
    // Nota: La tasa de interés la estamos asumiendo fija por simplicidad aquí,
    // pero podría ser seleccionable o calculada por el backend.
    const [loanInterestRate] = useState(5); // Tasa fija de ejemplo 5%
    const [creatingLoan, setCreatingLoan] = useState(false);
    const [createError, setCreateError] = useState(null);

    // Cargar préstamos
    const fetchLoans = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await loanApi.getLoans();
            setLoans(data);
        } catch (err) {
            setError(err.message || 'Error al cargar los préstamos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    // Manejadores del Modal de Creación
    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        // Resetear formulario del modal
        setLoanType('personal');
        setLoanAmount('');
        setLoanTerm('');
        setCreateError(null);
    };
    const handleShowCreateModal = () => setShowCreateModal(true);

    // Manejador de envío para crear préstamo
    const handleCreateLoan = async (e) => {
        e.preventDefault();
        setCreatingLoan(true);
        setCreateError(null);
        const amountNum = parseFloat(loanAmount);
        const termNum = parseInt(loanTerm, 10);

        if (isNaN(amountNum) || amountNum <= 0 || isNaN(termNum) || termNum <= 0) {
            setCreateError('Por favor, ingresa un monto y plazo válidos.');
            setCreatingLoan(false);
            return;
        }

        try {
            const loanData = {
                loanType,
                amount: amountNum,
                term: termNum,
                interestRate: loanInterestRate, // Usamos la tasa fija de ejemplo
            };
            await loanApi.createLoan(loanData);
            handleCloseCreateModal();
            fetchLoans(); // Recargar lista
            // Opcional: Mostrar mensaje de éxito temporal
        } catch (err) {
            setCreateError(err.message || 'No se pudo solicitar el préstamo.');
        } finally {
            setCreatingLoan(false);
        }
    };


    return (
        <Container>
            <Row className="align-items-center mb-4">
                <Col>
                    <h1>Mis Préstamos</h1>
                </Col>
                <Col xs="auto">
                    {/* Botón para abrir modal de solicitud */}
                    <Button variant="success" onClick={handleShowCreateModal}>
                        + Solicitar Préstamo
                    </Button>
                </Col>
            </Row>

            {loading && <LoadingSpinner />}
            {error && <AlertMessage variant="danger">{error}</AlertMessage>}

            {!loading && !error && (
                loans.length === 0 ? (
                    <AlertMessage variant="info">Aún no tienes préstamos activos.</AlertMessage>
                ) : (
                    <Row>
                        {loans.map(loan => (
                            <Col md={6} lg={4} key={loan._id} className="mb-3">
                                <LoanSummaryCard loan={loan} />
                            </Col>
                        ))}
                    </Row>
                )
            )}

            {/* Modal para Solicitar Préstamo */}
            <Modal show={showCreateModal} onHide={handleCloseCreateModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Solicitar Nuevo Préstamo</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateLoan}>
                    <Modal.Body>
                        {createError && <Alert variant="danger">{createError}</Alert>}
                        <Form.Group className="mb-3" controlId="loanTypeSelect">
                            <Form.Label>Tipo de Préstamo</Form.Label>
                            <Form.Select
                                value={loanType}
                                onChange={(e) => setLoanType(e.target.value)}
                                disabled={creatingLoan}
                            >
                                <option value="personal">Personal</option>
                                <option value="hipotecario">Hipotecario</option>
                                <option value="automotriz">Automotriz</option>
                                <option value="estudiantil">Estudiantil</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="loanAmountInput">
                            <Form.Label>Monto Solicitado (€)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Ej: 5000"
                                value={loanAmount}
                                onChange={(e) => setLoanAmount(e.target.value)}
                                required
                                min="1"
                                step="0.01"
                                disabled={creatingLoan}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="loanTermInput">
                            <Form.Label>Plazo (en meses)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Ej: 24"
                                value={loanTerm}
                                onChange={(e) => setLoanTerm(e.target.value)}
                                required
                                min="1"
                                step="1"
                                disabled={creatingLoan}
                            />
                        </Form.Group>
                         <Form.Group className="mb-3" controlId="loanRateInfo">
                            <Form.Label>Tasa de Interés Anual</Form.Label>
                            <Form.Control
                                type="text"
                                value={`${loanInterestRate}% (Ejemplo Fijo)`}
                                readOnly
                                disabled
                            />
                            <Form.Text className="text-muted">
                                La tasa final puede variar. Esto es solo un ejemplo.
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseCreateModal} disabled={creatingLoan}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={creatingLoan}>
                            {creatingLoan ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" /> Enviando Solicitud...
                                </>
                            ) : (
                                'Enviar Solicitud'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

        </Container>
    );
};

export default LoansPage;