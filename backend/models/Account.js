const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Referencia al modelo User
    },
    // Generaremos el número de cuenta en el servicio
    accountNumber: {
        type: String,
        required: true,
        unique: true,
    },
    accountType: {
        type: String,
        required: true,
        enum: ['ahorro', 'corriente'], // Ejemplo de tipos
        default: 'ahorro',
    },
    balance: {
        type: Number,
        required: true,
        default: 0.00,
    },

}, {
    timestamps: true
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;