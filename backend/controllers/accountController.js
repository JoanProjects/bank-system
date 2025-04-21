const accountService = require('../services/accountService');

// Crear una nueva cuenta
const createAccount = async (req, res, next) => {
    try {
        const newAccount = await accountService.createAccount(req.user._id, req.body);
        res.status(201).json(newAccount);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener todas las cuentas del usuario logueado
const getAccounts = async (req, res, next) => {
    try {
        const accounts = await accountService.getUserAccounts(req.user._id);
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las cuentas' });
    }
};

// Obtener balance de una cuenta específica
const getAccountBalance = async (req, res, next) => {
    try {
        const balanceData = await accountService.getAccountBalance(req.user._id, req.params.id);
        res.status(200).json(balanceData);
    } catch (error) {
         // El servicio ya lanza error si no se encuentra o no pertenece
         res.status(404).json({ message: error.message });
    }
};

// Obtener historial de una cuenta específica
const getAccountHistory = async (req, res, next) => {
     try {
        const history = await accountService.getAccountHistory(req.user._id, req.params.id);
        res.status(200).json(history);
    } catch (error) {
         res.status(404).json({ message: error.message });
    }
};

// Realizar un depósito
const makeDeposit = async (req, res, next) => {
    const { amount, description } = req.body;
    try {
        const result = await accountService.makeDeposit(req.user._id, req.params.id, amount, description);
         res.status(200).json({ message: 'Depósito realizado con éxito', balance: result.account.balance });
    } catch (error) {
         res.status(400).json({ message: error.message });
    }
};

// Realizar un retiro
const makeWithdrawal = async (req, res, next) => {
    const { amount, description } = req.body;
    try {
         const result = await accountService.makeWithdrawal(req.user._id, req.params.id, amount, description);
         res.status(200).json({ message: 'Retiro realizado con éxito', balance: result.account.balance });
    } catch (error) {
         res.status(400).json({ message: error.message });
    }
};

// Realizar una transferencia
 const makeTransfer = async (req, res, next) => {
    // La cuenta origen se saca del ID del usuario logueado y el ID de la cuenta en los params o body
    // Aquí asumimos que el ID de la cuenta origen está en el body, pero podría estar en params
    const { fromAccountId, toAccountNumber, amount, description } = req.body;
    try {
         // Asegurarse que el usuario solo pueda transferir DESDE sus propias cuentas
         // Podríamos validar que req.user._id coincide con el userId de fromAccountId en el servicio
         const result = await accountService.makeTransfer(req.user._id, fromAccountId, toAccountNumber, amount, description);
         res.status(200).json({ message: 'Transferencia realizada con éxito' });
    } catch (error) {
         res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createAccount,
    getAccounts,
    getAccountBalance,
    getAccountHistory,
    makeDeposit,
    makeWithdrawal,
    makeTransfer, // Asegúrate de tener una ruta específica para esto
};