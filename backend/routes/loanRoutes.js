const express = require('express');
const {
    createLoan,
    getLoans,
    getLoanDetails,
    getLoanHistory,
    makePayment,
} = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Aplicar protección a todas las rutas de préstamos
router.use(protect);

// Rutas principales para préstamos
router.route('/')
    .post(createLoan) // Crear préstamo
    .get(getLoans);    // Obtener todos los préstamos del usuario

// Rutas para un préstamo específico
router.route('/:id')
    .get(getLoanDetails); // Obtener detalles

// Ruta para historial de pagos
router.get('/:id/history', getLoanHistory);

// Ruta para realizar un pago
router.post('/:id/pay', makePayment);


module.exports = router;