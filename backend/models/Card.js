const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true,
    },
    // ¡NUNCA almacenes números de tarjeta reales así en producción! Usa tokenización.
    cardNumber: {
        type: String,
        required: true,
        unique: true,
        // Podrías añadir validación de formato (Luhn algorithm)
    },
    cardType: {
        type: String,
        required: true,
        enum: ['credito', 'debito'],
    },
    expiryDate: { // Formato MM/YY
        type: String,
        required: true,
        match: [/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, 'Fecha de expiración inválida (MM/YY)'],
    },
    status: {
        type: String,
        required: true,
        enum: ['activa', 'bloqueada', 'expirada', 'cancelada'],
        default: 'activa',
    },

    // Campos específicos para Tarjetas de Crédito
    creditLimit: {
        type: Number,
        required: function() { return this.cardType === 'credito'; },
    },
    availableBalance: { // Saldo disponible (Límite - Deuda)
        type: Number,
        required: function() { return this.cardType === 'credito'; },
        default: function() { return this.cardType === 'credito' ? this.creditLimit : undefined; }
    },
    currentDebt: { // Deuda actual
        type: Number,
        required: function() { return this.cardType === 'credito'; },
        default: 0,
    },

    // Campos específicos para Tarjetas de Débito
    linkedAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: function() { return this.cardType === 'debito'; },
    },

    // El CVV NUNCA se almacena.
}, {
    timestamps: true
});

// Middleware o validación para asegurar que availableBalance <= creditLimit
cardSchema.pre('save', function(next) {
    if (this.cardType === 'credito') {
        if (this.availableBalance > this.creditLimit) {
            this.availableBalance = this.creditLimit; // Cap available balance
        }
        if (this.availableBalance < 0) {
             this.availableBalance = 0; // Floor available balance
        }
         if (this.currentDebt < 0) {
             this.currentDebt = 0; // Floor debt
        }
         // Recalcular por si acaso, aunque la lógica de transacciones debería hacerlo
        this.availableBalance = this.creditLimit - this.currentDebt;
    }
    next();
});


const Card = mongoose.model('Card', cardSchema);

module.exports = Card;