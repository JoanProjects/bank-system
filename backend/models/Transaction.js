const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { // El usuario que INICIÓ la transacción o a quien pertenece la cuenta/préstamo/tarjeta principal
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    type: {
        type: String,
        required: true,
        enum: [
            'deposito', 'retiro', 'transferencia_salida', 'transferencia_entrada',
            'pago_prestamo', 'desembolso_prestamo',
            'pago_tarjeta', 'compra_tarjeta', 'avance_efectivo_tarjeta'
        ]
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
    date: {
        type: Date,
        default: Date.now
    },
    // Referencias opcionales según el tipo de transacción
    relatedAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        index: true, // Indexar para búsquedas rápidas de historial
    },
    relatedLoanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan', // Asumiendo que tendrás un modelo Loan
         index: true,
    },
    relatedCardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card', // Asumiendo que tendrás un modelo Card
         index: true,
    },
    // Detalles específicos para transferencias
    fromAccount: { // Número de cuenta origen (String)
        type: String,
    },
    toAccount: { // Número de cuenta destino (String)
        type: String,
    },
    // Podríamos añadir un campo 'status' ('pending', 'completed', 'failed')
}, {
    timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;