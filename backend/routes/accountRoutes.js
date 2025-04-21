const express = require('express');
const {
    createAccount,
    getAccounts,
    getAccountBalance,
    getAccountHistory,
    makeDeposit,
    makeWithdrawal,
    makeTransfer // Importar el controlador de transferencia
} = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Aplicar middleware 'protect' a todas las rutas de cuentas
router.use(protect);

// Rutas para obtener todas las cuentas y crear una nueva
// GET /api/accounts/
// POST /api/accounts/
router.route('/')
    .get(getAccounts)
    .post(createAccount);

// Ruta para realizar transferencias (requiere datos en el body)
// POST /api/accounts/transfer
router.post('/transfer', makeTransfer); // Mover aquí si es una acción general

// Rutas específicas para una cuenta por ID
// GET /api/accounts/:id/balance
router.get('/:id/balance', getAccountBalance);

// GET /api/accounts/:id/history
router.get('/:id/history', getAccountHistory);

// POST /api/accounts/:id/deposit
router.post('/:id/deposit', makeDeposit);

// POST /api/accounts/:id/withdraw
router.post('/:id/withdraw', makeWithdrawal);


module.exports = router;