const express = require('express');
const {
    createCard,
    getCards,
    getCardDetails,
    getCardHistory,
    makePayment,
    makePurchase,
    makeCashAdvance,
    updateStatus,
} = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Aplicar protección
router.use(protect);

// Rutas principales para tarjetas
router.route('/')
    .post(createCard)
    .get(getCards);

// Rutas para una tarjeta específica
router.route('/:id')
    .get(getCardDetails);

router.get('/:id/history', getCardHistory);
router.post('/:id/pay', makePayment);
router.post('/:id/purchase', makePurchase);
router.post('/:id/advance', makeCashAdvance);

// Ruta para cambiar estado
router.put('/:id/status', updateStatus); // Usar PUT para actualizar estado


module.exports = router;