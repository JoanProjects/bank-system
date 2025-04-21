// frontend/src/pages/CardsPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import cardApi from '../api/cardApi';
import accountApi from '../api/accountApi'; // Para vincular tarjetas de débito
import CardSummaryCard from '../components/specific/CardSummaryCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';

const CardsPage = () => {
    const [cards, setCards] = useState([]);
    const [userAccounts, setUserAccounts] = useState([]); // Para débito
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para Modal de Crear Tarjeta
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [cardType, setCardType] = useState('credito');
    const [expiryDate, setExpiryDate] = useState(''); // MM/YY
    const [creditLimit, setCreditLimit] = useState(''); // Solo si es crédito
    const [linkedAccountId, setLinkedAccountId] = useState(''); // Solo si es débito
    const [creatingCard, setCreatingCard] = useState(false);
    const [createError, setCreateError] = useState(null);

    // Cargar tarjetas y cuentas del usuario
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Cargar en paralelo
            const [cardsData, accountsData] = await Promise.all([
                cardApi.getCards(),
                accountApi.getAccounts() // Necesario para vincular tarjetas de débito
            ]);
            setCards(cardsData);
            setUserAccounts(accountsData);
        } catch (err) {
            setError(err.message || 'Error al cargar los datos.');
            setCards([]);
            setUserAccounts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Manejadores Modal Creación
    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        // Resetear formulario
        setCardType('credito');
        setExpiryDate('');
        setCreditLimit('');
        setLinkedAccountId('');
        setCreateError(null);
    };
    const handleShowCreateModal = () => setShowCreateModal(true);

    // Manejador Envío Crear Tarjeta
    const handleCreateCard = async (e) => {
        e.preventDefault();
        setCreatingCard(true);
        setCreateError(null);

        // Validación básica de fecha MM/YY
        if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiryDate)) {
             setCreateError('Formato de fecha de expiración inválido (MM/YY).');
             setCreatingCard(false);
             return;
        }

        let cardData = { cardType, expiryDate };

        if (cardType === 'credito') {
            const limitNum = parseFloat(creditLimit);
            if (isNaN(limitNum) || limitNum <= 0) {
                setCreateError('Ingresa un límite de crédito válido.');
                setCreatingCard(false);
                return;
            }
            cardData.creditLimit = limitNum;
        } else if (cardType === 'debito') {
            if (!linkedAccountId) {
                setCreateError('Debes seleccionar una cuenta para vincular la tarjeta de débito.');
                setCreatingCard(false);
                return;
            }
            cardData.linkedAccountId = linkedAccountId;
        }

        try {
            await cardApi.createCard(cardData);
            handleCloseCreateModal();
            fetchData(); // Recargar lista
        } catch (err) {
            setCreateError(err.message || 'No se pudo solicitar la tarjeta.');
        } finally {
            setCreatingCard(false);
        }
    };


    return (
        <Container>
            <Row className="align-items-center mb-4">
                <Col>
                    <h1>Mis Tarjetas</h1>
                </Col>
                <Col xs="auto">
                    <Button variant="success" onClick={handleShowCreateModal}>
                        + Solicitar Tarjeta
                    </Button>
                </Col>
            </Row>

            {loading && <LoadingSpinner />}
            {error && <AlertMessage variant="danger">{error}</AlertMessage>}

            {!loading && !error && (
                cards.length === 0 ? (
                    <AlertMessage variant="info">Aún no tienes tarjetas asociadas.</AlertMessage>
                ) : (
                    <Row>
                        {cards.map(card => (
                            <Col md={6} lg={4} key={card._id} className="mb-3">
                                <CardSummaryCard card={card} />
                            </Col>
                        ))}
                    </Row>
                )
            )}

             {/* Modal para Solicitar Tarjeta */}
            <Modal show={showCreateModal} onHide={handleCloseCreateModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Solicitar Nueva Tarjeta</Modal.Title>
                </Modal.Header>
                 <Form onSubmit={handleCreateCard}>
                    <Modal.Body>
                        {createError && <Alert variant="danger">{createError}</Alert>}
                        <Form.Group className="mb-3" controlId="cardTypeSelect">
                            <Form.Label>Tipo de Tarjeta</Form.Label>
                             <Form.Select
                                value={cardType}
                                onChange={(e) => setCardType(e.target.value)}
                                disabled={creatingCard}
                            >
                                <option value="credito">Crédito</option>
                                <option value="debito">Débito</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Campos condicionales */}
                         {cardType === 'credito' && (
                             <Form.Group className="mb-3" controlId="creditLimitInput">
                                <Form.Label>Límite de Crédito Solicitado (€)</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Ej: 1500"
                                    value={creditLimit}
                                    onChange={(e) => setCreditLimit(e.target.value)}
                                    required
                                    min="1"
                                    step="0.01"
                                    disabled={creatingCard}
                                />
                            </Form.Group>
                         )}
                          {cardType === 'debito' && (
                             <Form.Group className="mb-3" controlId="linkedAccountSelect">
                                <Form.Label>Vincular a Cuenta</Form.Label>
                                 <Form.Select
                                    value={linkedAccountId}
                                    onChange={(e) => setLinkedAccountId(e.target.value)}
                                    required
                                    disabled={creatingCard || userAccounts.length === 0}
                                >
                                     <option value="" disabled>-- Selecciona una cuenta --</option>
                                     {userAccounts.map(acc => (
                                        <option key={acc._id} value={acc._id}>
                                            {acc.accountNumber} ({acc.accountType}) - Saldo: {formatCurrency(acc.balance)}
                                        </option>
                                     ))}
                                </Form.Select>
                                 {userAccounts.length === 0 && <Form.Text className="text-danger">No tienes cuentas para vincular.</Form.Text>}
                            </Form.Group>
                         )}

                         <Form.Group className="mb-3" controlId="expiryDateInput">
                            <Form.Label>Fecha de Expiración</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="MM/YY"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                required
                                pattern="(0[1-9]|1[0-2])\/?([0-9]{2})" // Pattern para validación básica HTML5
                                title="Formato MM/YY"
                                maxLength="5" // Incluye el /
                                disabled={creatingCard}
                            />
                             <Form.Text className="text-muted">
                                Formato: MM/YY (ej: 12/28)
                            </Form.Text>
                        </Form.Group>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseCreateModal} disabled={creatingCard}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={creatingCard || (cardType === 'debito' && userAccounts.length === 0)}>
                            {creatingCard ? (
                                <><Spinner size="sm" /> Enviando Solicitud...</>
                            ) : (
                                'Solicitar Tarjeta'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

        </Container>
    );
};

export default CardsPage;