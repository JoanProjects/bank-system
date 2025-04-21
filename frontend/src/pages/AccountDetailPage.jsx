// frontend/src/pages/AccountDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form, Tab, Nav } from 'react-bootstrap';
import accountApi from '../api/accountApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import TransactionTable from '../components/common/TransactionTable';

// Helper para formatear moneda
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount); // Cambia EUR a tu moneda
}

const AccountDetailPage = () => {
    const { id: accountId } = useParams(); // Obtener el ID de la cuenta desde la URL

    // Estados de datos
    const [accountDetails, setAccountDetails] = useState(null); // { balance, accountNumber, accountType }
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para Modales de Transacciones
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'deposit', 'withdraw', 'transfer'
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [toAccountNumber, setToAccountNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [modalSuccess, setModalSuccess] = useState(null);


    // Función para cargar datos (balance e historial)
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Ejecutar ambas llamadas en paralelo
            const [balanceData, historyData] = await Promise.all([
                accountApi.getAccountBalance(accountId),
                accountApi.getAccountHistory(accountId)
            ]);
            setAccountDetails(balanceData);
            setTransactions(historyData);
        } catch (err) {
            setError(err.message || 'Error al cargar los detalles de la cuenta.');
        } finally {
            setLoading(false);
        }
    }, [accountId]); // Dependencia: accountId

    // Cargar datos al montar y cuando cambie accountId
    useEffect(() => {
        fetchData();
    }, [fetchData]);


    // Manejadores de Modales
    const handleShowModal = (type) => {
        setModalType(type);
        setShowModal(true);
        // Resetear campos y errores del modal
        setAmount('');
        setDescription('');
        setToAccountNumber('');
        setModalError(null);
        setModalSuccess(null);
        setSubmitting(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        // No reseteamos los datos aquí por si el usuario quiere reintentar
    };

    // Manejador de envío del formulario del Modal
    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setModalError(null);
        setModalSuccess(null);
        const numericAmount = parseFloat(amount);

        if (isNaN(numericAmount) || numericAmount <= 0) {
            setModalError('Por favor, ingresa un monto válido y positivo.');
            setSubmitting(false);
            return;
        }

        try {
            let result;
            if (modalType === 'deposit') {
                result = await accountApi.makeDeposit(accountId, numericAmount, description);
                setModalSuccess(`Depósito de ${formatCurrency(numericAmount)} realizado con éxito.`);
            } else if (modalType === 'withdraw') {
                result = await accountApi.makeWithdrawal(accountId, numericAmount, description);
                 setModalSuccess(`Retiro de ${formatCurrency(numericAmount)} realizado con éxito.`);
            } else if (modalType === 'transfer') {
                if (!toAccountNumber) {
                    setModalError('Por favor, ingresa el número de cuenta destino.');
                    setSubmitting(false);
                    return;
                }
                 result = await accountApi.makeTransfer(accountId, toAccountNumber, numericAmount, description);
                 setModalSuccess(`Transferencia de ${formatCurrency(numericAmount)} a ${toAccountNumber} realizada con éxito.`);
            }

            // Tras éxito: recargar datos, limpiar formulario y cerrar modal tras un delay
            fetchData(); // Recargar balance e historial
            setAmount('');
            setDescription('');
            setToAccountNumber('');
            setTimeout(() => {
                 handleCloseModal();
            }, 2000); // Cerrar tras 2 segundos para ver mensaje

        } catch (err) {
            setModalError(err.message || `Error al realizar la ${modalType}.`);
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) return <LoadingSpinner message="Cargando detalles de la cuenta..." />;
    if (error) return <AlertMessage variant="danger">{error}</AlertMessage>;
    if (!accountDetails) return <AlertMessage variant="warning">No se pudieron cargar los detalles de la cuenta.</AlertMessage>;

    return (
        <Container>
            <Button as={Link} to="/accounts" variant="outline-secondary" size="sm" className="mb-3">
                ← Volver a Mis Cuentas
            </Button>

            <Card className="mb-4 shadow-sm">
                 <Card.Header as="h4">
                    Cuenta N°: {accountDetails.accountNumber}
                     <span className="badge bg-secondary ms-2" style={{ fontSize: '0.8rem' }}>
                        {accountDetails.accountType?.charAt(0).toUpperCase() + accountDetails.accountType?.slice(1)}
                    </span>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <Card.Title>Saldo Actual</Card.Title>
                            <h2 className="display-5">{formatCurrency(accountDetails.balance)}</h2>
                        </Col>
                        <Col md={6} className="d-flex flex-column flex-md-row justify-content-md-end align-items-start align-items-md-center gap-2 mt-3 mt-md-0">
                             {/* Botones de acción rápida */}
                            <Button variant="success" onClick={() => handleShowModal('deposit')}>
                                Depositar
                            </Button>
                             <Button variant="warning" onClick={() => handleShowModal('withdraw')}>
                                Retirar
                            </Button>
                             <Button variant="info" onClick={() => handleShowModal('transfer')}>
                                Transferir
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

             {/* Historial de Transacciones */}
            <Row>
                <Col>
                    <h3>Historial de Movimientos</h3>
                    <TransactionTable transactions={transactions} />
                </Col>
            </Row>

             {/* Modal para Transacciones */}
            <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static"> {/* backdrop static evita cerrar al clickear fuera */}
                <Modal.Header closeButton={!submitting}>
                    <Modal.Title>
                         {modalType === 'deposit' && 'Realizar Depósito'}
                         {modalType === 'withdraw' && 'Realizar Retiro'}
                         {modalType === 'transfer' && 'Realizar Transferencia'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleTransactionSubmit}>
                    <Modal.Body>
                         {/* Mensajes de estado dentro del modal */}
                         {modalError && <Alert variant="danger">{modalError}</Alert>}
                         {modalSuccess && <Alert variant="success">{modalSuccess}</Alert>}

                        <Form.Group className="mb-3" controlId="transactionAmount">
                            <Form.Label>Monto</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                min="0.01"
                                step="0.01"
                                disabled={submitting || !!modalSuccess} // Deshabilitar si está enviando o si ya tuvo éxito
                            />
                        </Form.Group>

                         {/* Campo Cuenta Destino solo para Transferencias */}
                         {modalType === 'transfer' && (
                             <Form.Group className="mb-3" controlId="toAccountNumber">
                                <Form.Label>Cuenta Destino</Form.Label>
                                <Form.Control
                                    type="text" // O 'number' si son solo números
                                    placeholder="Número de cuenta destino"
                                    value={toAccountNumber}
                                    onChange={(e) => setToAccountNumber(e.target.value)}
                                    required
                                    disabled={submitting || !!modalSuccess}
                                />
                            </Form.Group>
                         )}

                        <Form.Group className="mb-3" controlId="transactionDescription">
                            <Form.Label>Descripción (Opcional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={submitting || !!modalSuccess}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={handleCloseModal} disabled={submitting}>
                            {modalSuccess ? 'Cerrar' : 'Cancelar'}
                        </Button>
                         {/* Mostrar botón de envío solo si no hay éxito aún */}
                        {!modalSuccess && (
                            <Button variant="primary" type="submit" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/> Procesando...
                                    </>
                                ) : (
                                     `Confirmar ${modalType?.charAt(0).toUpperCase() + modalType?.slice(1)}`
                                )}
                            </Button>
                        )}
                    </Modal.Footer>
                </Form>
            </Modal>

        </Container>
    );
};

export default AccountDetailPage;