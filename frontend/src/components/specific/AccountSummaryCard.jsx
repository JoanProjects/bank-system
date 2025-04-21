// frontend/src/components/specific/AccountSummaryCard.jsx
import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Helper para formatear moneda
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount); // Cambia EUR a tu moneda
}

const AccountSummaryCard = ({ account }) => {
    return (
        <Card className="mb-3 shadow-sm">
            <Card.Body>
                <Card.Title>Cuenta N°: {account.accountNumber}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                    Tipo: {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                </Card.Subtitle>
                <Card.Text>
                    <strong>Saldo Actual:</strong> {formatCurrency(account.balance)}
                </Card.Text>
                <Button variant="primary" as={Link} to={`/accounts/${account._id}`}>
                    Ver Detalles y Movimientos
                </Button>
            </Card.Body>
            {/* Podrías añadir un Card.Footer con la fecha de creación si quieres */}
            {/* <Card.Footer>
                <small className="text-muted">Creada el: {new Date(account.createdAt).toLocaleDateString()}</small>
            </Card.Footer> */}
        </Card>
    );
};

export default AccountSummaryCard;