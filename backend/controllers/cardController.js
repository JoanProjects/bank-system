const cardService = require('../services/cardService');

// POST /api/cards - Crear tarjeta
const createCard = async (req, res, next) => {
    try {
        const card = await cardService.createCard(req.user._id, req.body);
        res.status(201).json(card);
    } catch (error) {
         res.status(400).json({ message: error.message });
    }
};

// GET /api/cards - Obtener tarjetas del usuario
const getCards = async (req, res, next) => {
    try {
        const cards = await cardService.getUserCards(req.user._id);
        res.status(200).json(cards);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tarjetas' });
    }
};

// GET /api/cards/:id - Obtener detalles tarjeta
const getCardDetails = async (req, res, next) => {
    try {
        const card = await cardService.getCardDetails(req.user._id, req.params.id);
        res.status(200).json(card);
    } catch (error) {
         res.status(404).json({ message: error.message });
    }
};

// GET /api/cards/:id/history - Obtener historial tarjeta
const getCardHistory = async (req, res, next) => {
     try {
        const history = await cardService.getCardTransactionHistory(req.user._id, req.params.id);
        res.status(200).json(history);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// POST /api/cards/:id/pay - Pagar tarjeta crédito
const makePayment = async (req, res, next) => {
    const { amount, paymentAccountId } = req.body;
     try {
        const result = await cardService.makeCardPayment(req.user._id, req.params.id, amount, paymentAccountId);
        res.status(200).json(result);
    } catch (error) {
         res.status(400).json({ message: error.message });
    }
};

// POST /api/cards/:id/purchase - Realizar compra
const makePurchase = async (req, res, next) => {
    const { amount, description } = req.body;
     try {
        const result = await cardService.makePurchase(req.user._id, req.params.id, amount, description);
        res.status(200).json(result);
    } catch (error) {
         res.status(400).json({ message: error.message });
    }
};

// POST /api/cards/:id/advance - Avance efectivo
const makeCashAdvance = async (req, res, next) => {
    const { amount } = req.body;
     try {
        const result = await cardService.makeCashAdvance(req.user._id, req.params.id, amount);
        res.status(200).json(result);
    } catch (error) {
         res.status(400).json({ message: error.message });
    }
};

// PUT /api/cards/:id/status - Cambiar estado (bloquear, activar, cancelar)
const updateStatus = async (req, res, next) => {
    const { status } = req.body; // Espera el nuevo estado en el body ('bloqueada', 'activa', 'cancelada')
     try {
        const result = await cardService.updateCardStatus(req.user._id, req.params.id, status);
        res.status(200).json(result);
    } catch (error) {
         res.status(400).json({ message: error.message });
    }
};


module.exports = {
    createCard,
    getCards,
    getCardDetails,
    getCardHistory,
    makePayment,
    makePurchase,
    makeCashAdvance,
    updateStatus,
};