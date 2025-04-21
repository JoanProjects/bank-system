const loanService = require('../services/loanService');

// POST /api/loans - Crear un nuevo préstamo
const createLoan = async (req, res, next) => {
    try {
        const loan = await loanService.createLoan(req.user._id, req.body);
        res.status(201).json(loan);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET /api/loans - Obtener todos los préstamos del usuario
const getLoans = async (req, res, next) => {
    try {
        const loans = await loanService.getUserLoans(req.user._id);
        res.status(200).json(loans);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener préstamos' });
    }
};

// GET /api/loans/:id - Obtener detalles de un préstamo
const getLoanDetails = async (req, res, next) => {
    try {
        const loan = await loanService.getLoanDetails(req.user._id, req.params.id);
        res.status(200).json(loan);
    } catch (error) {
         // El servicio lanza error si no se encuentra o no pertenece
        res.status(404).json({ message: error.message });
    }
};

// GET /api/loans/:id/history - Obtener historial de pagos
const getLoanHistory = async (req, res, next) => {
     try {
        const history = await loanService.getLoanPaymentHistory(req.user._id, req.params.id);
        res.status(200).json(history);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// POST /api/loans/:id/pay - Realizar un pago
const makePayment = async (req, res, next) => {
    const { amount, paymentAccountId } = req.body; // Obtener monto y cuenta de pago opcional
    try {
        const result = await loanService.makeLoanPayment(req.user._id, req.params.id, amount, paymentAccountId);
        res.status(200).json(result);
    } catch (error) {
         res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createLoan,
    getLoans,
    getLoanDetails,
    getLoanHistory,
    makePayment,
};