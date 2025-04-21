// frontend/src/components/specific/CardSummaryCard.jsx
import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Helpers (considera mover a utils/formatters.js)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
}
const getStatusBadgeVariant = (status) => {
    switch (status) {
        case 'activa': return 'success';
        case 'bloqueada': return 'warning';
        case 'expirada':
        case 'cancelada': return 'danger';
        default: return 'secondary';
    }
}

const CardSummaryCard = ({ card }) => {
    // Muestra solo los últimos 4 dígitos por "seguridad" visual
    const maskedCardNumber = `**** **** **** ${card.cardNumber.slice(-4)}`;

    return (
        <Card className="mb-3 shadow-sm">
            <Card.Body>
                <Card.Title className="d-flex justify-content-between align-items-start">
                    <span>Tarjeta {card.cardType.charAt(0).toUpperCase() + card.cardType.slice(1)}</span>
                     <Badge pill bg={getStatusBadgeVariant(card.status)} text="white">
                         {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                     </Badge>
                </Card.Title>
                <Card.Subtitle className="mb-2 text-muted font-monospace">
                    {maskedCardNumber}
                </Card.Subtitle>
                <Card.Text>
                    Expira: {card.expiryDate}
                    {card.cardType === 'credito' && (
                        <>
                            <br/>
                            <span>Disponible: <strong>{formatCurrency(card.availableBalance)}</strong> / {formatCurrency(card.creditLimit)}</span>
                            <br/>
                             <span>Deuda Actual: <strong className="text-danger">{formatCurrency(card.currentDebt)}</strong></span>
                         </>
                    )}
                     {card.cardType === 'debito' && card.linkedAccountId && (
                        <>
                            <br/>
                            <span>Vinculada a Cta: {card.linkedAccountId.accountNumber}</span>
                        </>
                    )}
                </Card.Text>
                <Button variant="primary" as={Link} to={`/cards/${card._id}`} size="sm">
                    Ver Detalles y Movimientos
                </Button>
            </Card.Body>
             <Card.Footer>
                <small className="text-muted">Emitida el: {new Date(card.createdAt).toLocaleDateString()}</small>
            </Card.Footer>
        </Card>
    );
};

export default CardSummaryCard;