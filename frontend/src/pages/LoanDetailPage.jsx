// frontend/src/pages/LoanDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form, Badge } from 'react-bootstrap';
import loanApi from '../api/loanApi';
import accountApi from '../api/accountApi'; // Para obtener cuentas para pagar
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import TransactionTable from '../components/common/TransactionTable'; // Reutilizamos la tabla

// Helpers (considera moverlos a utils/formatters.js)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
}
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
}
const getStatusBadgeVariant = (status) => {
    // ... (misma función que en LoanSummaryCard)
    switch (status) {
        case 'activo': return 'success';
        case 'pagado': return 'secondary';
        case 'incumplimiento': return 'danger';
        default: return 'warning';
    }
}

const LoanDetailPage = () => {
    const { id: loanId } = useParams();

    // Estados de datos
    const [loanDetails, setLoanDetails] = useState(null);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [userAccounts, setUserAccounts] = useState([]); // Cuentas para pagar
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para Modal de Pago
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentAccountId, setPaymentAccountId] = useState(''); // ID de la cuenta origen
    const [payingLoan, setPayingLoan] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [paymentSuccess, setPaymentSuccess] = useState(null);

    // Cargar detalles, historial y cuentas de usuario
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [details, history, accounts] = await Promise.all([
                loanApi.getLoanDetails(loanId),
                loanApi.getLoanPaymentHistory(loanId),
                accountApi.getAccounts() // Obtener cuentas para el selector de pago
            ]);
            setLoanDetails(details);
            setPaymentHistory(history);
            setUserAccounts(accounts);
        } catch (err) {
            setError(err.message || 'Error al cargar los datos del préstamo.');
            setLoanDetails(null); // Asegurar que no se muestren datos viejos
            setPaymentHistory([]);
            setUserAccounts([]);
        } finally {
            setLoading(false);
        }
    }, [loanId]); // Dependencia del ID del préstamo

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Manejadores del Modal de Pago
    const handleShowPaymentModal = () => {
        setPaymentAmount(''); // Resetear monto
        setPaymentAccountId(userAccounts[0]?._id || ''); // Preseleccionar primera cuenta si existe
        setPaymentError(null);
        setPaymentSuccess(null);
        setShowPaymentModal(true);
    };
    const handleClosePaymentModal = () => setShowPaymentModal(false);

    // Manejador de envío para pago
    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setPayingLoan(true);
        setPaymentError(null);
        setPaymentSuccess(null);
        const amountNum = parseFloat(paymentAmount);

        if (!paymentAccountId) {
             setPaymentError('Debes seleccionar una cuenta de origen para el pago.');
             setPayingLoan(false);
             return;
        }
        if (isNaN(amountNum) || amountNum <= 0) {
            setPaymentError('Por favor, ingresa un monto de pago válido.');
            setPayingLoan(false);
            return;
        }

        try {
            const result = await loanApi.makeLoanPayment(loanId, amountNum, paymentAccountId);
            setPaymentSuccess(result.message || 'Pago realizado con éxito.');
            // Actualizar datos sin recargar toda la página
            fetchData(); // Vuelve a cargar todo (detalles y historial)
            // Cerrar modal después de un momento
             setTimeout(() => {
                 handleClosePaymentModal();
             }, 2000);

        } catch (err) {
             setPaymentError(err.message || 'Error al procesar el pago.');
        } finally {
             setPayingLoan(false);
        }
    };


    if (loading) return <LoadingSpinner message="Cargando detalles del préstamo..." />;
    if (error) return <AlertMessage variant="danger">{error}</AlertMessage>;
    if (!loanDetails) return <AlertMessage variant="warning">No se encontraron detalles para este préstamo.</AlertMessage>;


    return (
        <Container>
             <Button as={Link} to="/loans" variant="outline-secondary" size="sm" className="mb-3">
                ← Volver a Mis Préstamos
            </Button>

             <Card className="mb-4 shadow-sm">
                 <Card.Header as="h4" className="d-flex justify-content-between align-items-start">
                    <span>Detalles del Préstamo {loanDetails.loanType.charAt(0).toUpperCase() + loanDetails.loanType.slice(1)}</span>
                    <Badge pill bg={getStatusBadgeVariant(loanDetails.status)} text="white">
                         {loanDetails.status.charAt(0).toUpperCase() + loanDetails.status.slice(1)}
                    </Badge>
                 </Card.Header>
                <Card.Body>
                     <Row>
                        <Col md={4}><strong>Monto Original:</strong></Col>
                        <Col md={8}>{formatCurrency(loanDetails.amount)}</Col>
                    </Row>
                    <Row>
                        <Col md={4}><strong>Saldo Pendiente:</strong></Col>
                        <Col md={8}><strong className="text-danger">{formatCurrency(loanDetails.remainingBalance)}</strong></Col>
                    </Row>
                     <Row>
                        <Col md={4}><strong>Tasa de Interés:</strong></Col>
                        <Col md={8}>{loanDetails.interestRate}% Anual</Col>
                    </Row>
                     <Row>
                        <Col md={4}><strong>Plazo Original:</strong></Col>
                        <Col md={8}>{loanDetails.term} meses</Col>
                    </Row>
                     <Row>
                        <Col md={4}><strong>Fecha Desembolso:</strong></Col>
                        <Col md={8}>{formatDate(loanDetails.disbursementDate)}</Col>
                    </Row>
                     <Row className="mt-3">
                        <Col className="text-end">
                            {loanDetails.status === 'activo' && loanDetails.remainingBalance > 0 && (
                                 <Button variant="success" onClick={handleShowPaymentModal}>
                                    Realizar Pago
                                </Button>
                            )}
                             {loanDetails.status === 'pagado' && (
                                <span className="text-muted">Este préstamo ya ha sido pagado.</span>
                            )}
                             {loanDetails.status === 'incumplimiento' && (
                                <span className="text-danger">Este préstamo está en incumplimiento. Contacte al banco.</span>
                            )}
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

             {/* Historial de Pagos */}
            <Row>
                <Col>
                    <h3>Historial de Pagos</h3>
                     {/* Usamos la misma tabla, pero filtramos las transacciones si es necesario */}
                     {/* En este caso, getLoanPaymentHistory ya devuelve solo pagos */}
                    <TransactionTable transactions={paymentHistory} />
                </Col>
            </Row>

            {/* Modal para Realizar Pago */}
            <Modal show={showPaymentModal} onHide={handleClosePaymentModal} centered backdrop="static">
                <Modal.Header closeButton={!payingLoan}>
                    <Modal.Title>Realizar Pago al Préstamo</Modal.Title>
                </Modal.Header>
                 <Form onSubmit={handlePaymentSubmit}>
                    <Modal.Body>
                        {paymentError && <Alert variant="danger">{paymentError}</Alert>}
                        {paymentSuccess && <Alert variant="success">{paymentSuccess}</Alert>}

                        <Form.Group className="mb-3" controlId="paymentAmount">
                            <Form.Label>Monto a Pagar (€)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="0.00"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                required
                                min="0.01"
                                step="0.01"
                                max={loanDetails.remainingBalance} // Sugerir no pagar más de lo debido
                                disabled={payingLoan || !!paymentSuccess}
                            />
                             <Form.Text className="text-muted">
                                Saldo pendiente actual: {formatCurrency(loanDetails.remainingBalance)}
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="paymentAccountSelect">
                            <Form.Label>Pagar Desde la Cuenta</Form.Label>
                             <Form.Select
                                value={paymentAccountId}
                                onChange={(e) => setPaymentAccountId(e.target.value)}
                                required
                                disabled={payingLoan || !!paymentSuccess || userAccounts.length === 0}
                            >
                                <option value="" disabled>-- Selecciona una cuenta --</option>
                                {userAccounts.map(acc => (
                                    <option key={acc._id} value={acc._id} disabled={acc.balance <= 0}>
                                        {acc.accountNumber} ({acc.accountType}) - Saldo: {formatCurrency(acc.balance)}
                                    </option>
                                ))}
                            </Form.Select>
                            {userAccounts.length === 0 && <Form.Text className="text-danger">No tienes cuentas disponibles para realizar el pago.</Form.Text>}
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClosePaymentModal} disabled={payingLoan}>
                            {paymentSuccess ? 'Cerrar' : 'Cancelar'}
                        </Button>
                        {!paymentSuccess && (
                            <Button variant="primary" type="submit" disabled={payingLoan || !paymentAccountId || userAccounts.length === 0}>
                                {payingLoan ? (
                                    <><Spinner size="sm" /> Pagando...</>
                                ) : (
                                    'Confirmar Pago'
                                )}
                            </Button>
                        )}
                    </Modal.Footer>
                </Form>
            </Modal>

        </Container>
    );
};

export default LoanDetailPage;