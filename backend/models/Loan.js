const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true, // Para buscar préstamos por usuario
    },
    loanType: {
        type: String,
        required: true,
        enum: ['personal', 'hipotecario', 'automotriz', 'estudiantil'], // Tipos de ejemplo
        default: 'personal',
    },
    amount: { // Monto original del préstamo
        type: Number,
        required: true,
    },
    interestRate: { // Tasa de interés anual (ej: 5 para 5%)
        type: Number,
        required: true,
    },
    term: { // Plazo en meses
        type: Number,
        required: true,
    },
    remainingBalance: { // Saldo pendiente
        type: Number,
        required: true,
        default: function() { return this.amount; } // Inicialmente es el monto total
    },
    status: {
        type: String,
        required: true,
        enum: ['activo', 'pagado', 'incumplimiento'],
        default: 'activo',
    },
    disbursementDate: { // Fecha de desembolso
        type: Date,
        default: Date.now,
    },
    // Podríamos añadir 'nextPaymentDate', 'monthlyPaymentAmount' si se requiere más detalle
}, {
    timestamps: true // createdAt, updatedAt
});

// Validar que el saldo restante no sea negativo (aunque la lógica de pago debería prevenirlo)
loanSchema.path('remainingBalance').validate(function(value) {
    return value >= 0;
}, 'El saldo restante no puede ser negativo.');

const Loan = mongoose.model('Loan', loanSchema);

module.exports = Loan;