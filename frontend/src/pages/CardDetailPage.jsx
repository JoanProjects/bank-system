// frontend/src/pages/CardDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form, Badge } from 'react-bootstrap';
import cardApi from '../api/cardApi';
import accountApi from '../api/accountApi'; // Para pagar tarjetas de crédito
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import TransactionTable from '../components/common/TransactionTable';

// Helpers
const formatCurrency = (amount) => {
    // Manejar undefined o null para evitar errores
    if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
}
const getStatusBadgeVariant = (status) => {
    // ... (misma función que en CardSummaryCard) ...
     switch (status) {
        case 'activa': return 'success';
        case 'bloqueada': return 'warning';
        case 'expirada':
        case 'cancelada': return 'danger';
        default: return 'secondary';
    }
}
const formatDate = (dateString) => { // Para historial
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

const CardDetailPage = () => {
    const { id: cardId } = useParams();

    // Estados de datos
    const [cardDetails, setCardDetails] = useState(null);
    const [cardHistory, setCardHistory] = useState([]);
    const [userAccounts, setUserAccounts] = useState([]); // Para pagar crédito
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para Modales de Acción
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'pay', 'advance'
    const [actionAmount, setActionAmount] = useState('');
    const [paymentAccountId, setPaymentAccountId] = useState(''); // Para pagar
    const [submittingAction, setSubmittingAction] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [actionSuccess, setActionSuccess] = useState(null);

    // Cargar detalles tarjeta, historial y cuentas
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
             const [details, history, accounts] = await Promise.all([
                cardApi.getCardDetails(cardId),
                cardApi.getCardHistory(cardId),
                accountApi.getAccounts() // Para selector de pago
            ]);
            setCardDetails(details);
            setCardHistory(history);
            setUserAccounts(accounts);
        } catch (err) {
            setError(err.message || 'Error al cargar los datos de la tarjeta.');
            setCardDetails(null);
            setCardHistory([]);
            setUserAccounts([]);
        } finally {
            setLoading(false);
        }
    }, [cardId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Manejadores Modales de Acción
    const handleShowModal = (type) => {
        setModalType(type);
        setActionAmount('');
        setPaymentAccountId(userAccounts[0]?._id || ''); // Preseleccionar cuenta para pago
        setActionError(null);
        setActionSuccess(null);
        setShowModal(true);
    };
    const handleCloseModal = () => setShowModal(false);

     // Manejador Envío Acciones (Pago/Avance)
    const handleActionSubmit = async (e) => {
        e.preventDefault();
        setSubmittingAction(true);
        setActionError(null);
        setActionSuccess(null);
        const amountNum = parseFloat(actionAmount);

         if (isNaN(amountNum) || amountNum <= 0) {
            setActionError('Por favor, ingresa un monto válido.');
            setSubmittingAction(false);
            return;
        }

         try {
            let result;
            if (modalType === 'pay') {
                 if (!paymentAccountId) {
                     setActionError('Debes seleccionar una cuenta de origen para el pago.');
                     setSubmittingAction(false);
                     return;
                 }
                 result = await cardApi.makeCardPayment(cardId, amountNum, paymentAccountId);
                 setActionSuccess(result.message || 'Pago realizado con éxito.');
             } else if (modalType === 'advance') {
                 result = await cardApi.makeCashAdvance(cardId, amountNum);
                 setActionSuccess(result.message || 'Avance procesado con éxito.');
             }

             // Recargar datos y cerrar modal
             fetchData();
             setTimeout(() => {
                 handleCloseModal();
             }, 2000);

         } catch (err) {
             setActionError(err.message || `Error al procesar la acción.`);
         } finally {
             setSubmittingAction(false);
         }
    };


    if (loading) return <LoadingSpinner message="Cargando detalles de la tarjeta..." />;
    if (error) return <AlertMessage variant="danger">{error}</AlertMessage>;
    if (!cardDetails) return <AlertMessage variant="warning">No se encontraron detalles para esta tarjeta.</AlertMessage>;

    // Para mostrar el número de tarjeta de forma segura
    const maskedCardNumber = `**** **** **** ${cardDetails.cardNumber.slice(-4)}`;

    return (
        <Container>
            <Button as={Link} to="/cards" variant="outline-secondary" size="sm" className="mb-3">
                ← Volver a Mis Tarjetas
            </Button>

            <Card className="mb-4 shadow-sm">
                 <Card.Header as="h4" className="d-flex justify-content-between align-items-start">
                     <span>Tarjeta {cardDetails.cardType.charAt(0).toUpperCase() + cardDetails.cardType.slice(1)} {maskedCardNumber}</span>
                    <Badge pill bg={getStatusBadgeVariant(cardDetails.status)} text="white">
                         {cardDetails.status.charAt(0).toUpperCase() + cardDetails.status.slice(1)}
                    </Badge>
                 </Card.Header>
                 <Card.Body>
                     {/* Detalles Específicos */}
                     <Row>
                         <Col md={4}><strong>Expira:</strong></Col>
                         <Col md={8}>{cardDetails.expiryDate}</Col>
                     </Row>

                     {cardDetails.cardType === 'credito' && (
                        <>
                             <Row>
                                <Col md={4}><strong>Límite de Crédito:</strong></Col>
                                <Col md={8}>{formatCurrency(cardDetails.creditLimit)}</Col>
                            </Row>
                            <Row>
                                <Col md={4}><strong>Saldo Disponible:</strong></Col>
                                <Col md={8}><strong className="text-success">{formatCurrency(cardDetails.availableBalance)}</strong></Col>
                             </Row>
                             <Row>
                                <Col md={4}><strong>Deuda Actual:</strong></Col>
                                <Col md={8}><strong className="text-danger">{formatCurrency(cardDetails.currentDebt)}</strong></Col>
                            </Row>
                        </>
                     )}

                     {cardDetails.cardType === 'debito' && cardDetails.linkedAccountId && (
                         <Row>
                             <Col md={4}><strong>Vinculada a Cuenta:</strong></Col>
                             <Col md={8}>
                                 {cardDetails.linkedAccountId.accountNumber} ({formatCurrency(cardDetails.linkedAccountId.balance)})
                             </Col>
                         </Row>
                     )}

                     {/* Botones de Acción */}
                     <Row className="mt-3">
                        <Col className="d-flex justify-content-end gap-2">
                            {cardDetails.cardType === 'credito' && cardDetails.status === 'activa' && cardDetails.currentDebt > 0 && (
                                <Button variant="success" size="sm" onClick={() => handleShowModal('pay')}>
                                    Realizar Pago
                                </Button>
                             )}
                             {cardDetails.cardType === 'credito' && cardDetails.status === 'activa' && (
                                <Button variant="warning" size="sm" onClick={() => handleShowModal('advance')}>
                                    Avance de Efectivo
                                </Button>
                             )}
                             {/* Podríamos añadir botón para bloquear/desbloquear */}
                             {/* <Button variant="danger" size="sm" onClick={handleBlockCard}>Bloquear</Button> */}
                        </Col>
                     </Row>
                 </Card.Body>
             </Card>

             {/* Historial de Movimientos */}
             <Row>
                <Col>
                    <h3>Historial de Movimientos</h3>
                    <TransactionTable transactions={cardHistory} />
                </Col>
             </Row>


             {/* Modal para Pago / Avance */}
             <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static">
                <Modal.Header closeButton={!submittingAction}>
                    <Modal.Title>
                        {modalType === 'pay' && 'Realizar Pago a Tarjeta'}
                        {modalType === 'advance' && 'Solicitar Avance de Efectivo'}
                    </Modal.Title>
                </Modal.Header>
                 <Form onSubmit={handleActionSubmit}>
                    <Modal.Body>
                         {actionError && <Alert variant="danger">{actionError}</Alert>}
                         {actionSuccess && <Alert variant="success">{actionSuccess}</Alert>}

                         <Form.Group className="mb-3" controlId="actionAmount">
                             <Form.Label>Monto (€)</Form.Label>
                             <Form.Control
                                type="number"
                                placeholder="0.00"
                                value={actionAmount}
                                onChange={(e) => setActionAmount(e.target.value)}
                                required
                                min="0.01"
                                step="0.01"
                                // Límite máximo para pago es la deuda, para avance es el disponible
                                max={modalType === 'pay' ? cardDetails?.currentDebt : cardDetails?.availableBalance}
                                disabled={submittingAction || !!actionSuccess}
                            />
                            {modalType === 'pay' &&
                                <Form.Text className="text-muted">Deuda actual: {formatCurrency(cardDetails?.currentDebt)}</Form.Text>
                            }
                             {modalType === 'advance' &&
                                <Form.Text className="text-muted">Disponible para avance: {formatCurrency(cardDetails?.availableBalance)}</Form.Text>
                            }
                         </Form.Group>

                        {/* Selector de cuenta origen SOLO para PAGOS */}
                        {modalType === 'pay' && (
                            <Form.Group className="mb-3" controlId="paymentAccountSelectModal">
                                <Form.Label>Pagar Desde la Cuenta</Form.Label>
                                <Form.Select
                                    value={paymentAccountId}
                                    onChange={(e) => setPaymentAccountId(e.target.value)}
                                    required
                                    disabled={submittingAction || !!actionSuccess || userAccounts.length === 0}
                                >
                                     <option value="" disabled>-- Selecciona una cuenta --</option>
                                     {userAccounts.map(acc => (
                                        <option key={acc._id} value={acc._id} disabled={acc.balance <= 0}>
                                            {acc.accountNumber} ({acc.accountType}) - Saldo: {formatCurrency(acc.balance)}
                                        </option>
                                     ))}
                                </Form.Select>
                                {userAccounts.length === 0 && <Form.Text className="text-danger">No tienes cuentas disponibles.</Form.Text>}
                            </Form.Group>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal} disabled={submittingAction}>
                            {actionSuccess ? 'Cerrar' : 'Cancelar'}
                        </Button>
                        {!actionSuccess && (
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={submittingAction || (modalType === 'pay' && !paymentAccountId) || (modalType === 'pay' && userAccounts.length === 0)}
                            >
                                {submittingAction ? (
                                    <><Spinner size="sm"/> Procesando...</>
                                ) : (
                                    `Confirmar ${modalType === 'pay' ? 'Pago' : 'Avance'}`
                                )}
                            </Button>
                        )}
                    </Modal.Footer>
                </Form>
            </Modal>


        </Container>
    );
};

export default CardDetailPage;