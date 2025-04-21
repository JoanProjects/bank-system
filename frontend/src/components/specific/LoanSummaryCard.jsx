// frontend/src/components/specific/LoanSummaryCard.jsx
import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Helper para formatear moneda (puedes moverlo a un archivo utils/formatters.js si lo usas mucho)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount); // Cambia EUR a tu moneda
}

// Helper para obtener color de badge según estado
const getStatusBadgeVariant = (status) => {
    switch (status) {
        case 'activo': return 'success';
        case 'pagado': return 'secondary';
        case 'incumplimiento': return 'danger';
        default: return 'warning';
    }
}

const LoanSummaryCard = ({ loan }) => {
    return (
        <Card className="mb-3 shadow-sm">
            <Card.Body>
                <Card.Title className="d-flex justify-content-between align-items-start">
                    <span>Préstamo {loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1)}</span>
                     <Badge pill bg={getStatusBadgeVariant(loan.status)} text="white">
                         {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                     </Badge>
                </Card.Title>
                 <Card.Subtitle className="mb-2 text-muted">
                    Monto Original: {formatCurrency(loan.amount)}
                </Card.Subtitle>
                <Card.Text>
                    <strong>Saldo Pendiente:</strong> {formatCurrency(loan.remainingBalance)}
                    <br/>
                    <small className="text-muted">
                        Tasa: {loan.interestRate}% | Plazo: {loan.term} meses
                    </small>
                </Card.Text>
                <Button variant="primary" as={Link} to={`/loans/${loan._id}`} size="sm">
                    Ver Detalles y Pagos
                </Button>
            </Card.Body>
             <Card.Footer>
                <small className="text-muted">Solicitado el: {new Date(loan.createdAt).toLocaleDateString()}</small>
            </Card.Footer>
        </Card>
    );
};

export default LoanSummaryCard;