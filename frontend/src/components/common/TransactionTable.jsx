// frontend/src/components/common/TransactionTable.jsx
import React from 'react';
import { Table } from 'react-bootstrap';
import AlertMessage from './AlertMessage';

// Helper para formatear moneda
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount); // Cambia EUR a tu moneda
}

// Helper para formatear fecha
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

// Determinar si es entrada o salida para estilo
const getAmountStyle = (type) => {
    const incomeTypes = ['deposito', 'transferencia_entrada', 'desembolso_prestamo'];
    // const expenseTypes = ['retiro', 'transferencia_salida', 'pago_prestamo', 'pago_tarjeta', 'compra_tarjeta', 'avance_efectivo_tarjeta'];
    return incomeTypes.includes(type) ? 'text-success' : 'text-danger';
}

const TransactionTable = ({ transactions }) => {
    if (!transactions || transactions.length === 0) {
        return <AlertMessage variant="info">No hay movimientos registrados para esta cuenta.</AlertMessage>;
    }

    return (
        <Table striped bordered hover responsive size="sm">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th className="text-end">Monto</th>
                </tr>
            </thead>
            <tbody>
                {transactions.map(tx => (
                    <tr key={tx._id}>
                        <td>{formatDate(tx.date)}</td>
                        <td>{tx.type.replace('_', ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())}</td>
                        <td>{tx.description || '-'}</td>
                        <td className={`text-end ${getAmountStyle(tx.type)}`}>
                            {formatCurrency(tx.amount)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default TransactionTable;