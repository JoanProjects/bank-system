const mongoose = require('mongoose');
const Loan = require('../models/Loan');
const Account = require('../models/Account'); // Para pagos desde cuenta
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Crear un nuevo préstamo (simplificado, sin desembolso real a cuenta)
const createLoan = async (userId, loanData) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const { loanType, amount, interestRate, term } = loanData;
    if (!loanType || !amount || !interestRate || !term || amount <= 0 || interestRate <= 0 || term <= 0) {
         throw new Error('Datos del préstamo inválidos o incompletos.');
    }

    const newLoan = await Loan.create({
        userId,
        loanType,
        amount,
        interestRate,
        term,
        remainingBalance: amount, // Saldo inicial es el monto total
        status: 'activo',
    });

    // Opcional: Crear una transacción de desembolso (informativa)
    await Transaction.create({
        userId,
        type: 'desembolso_prestamo',
        amount: amount,
        description: `Desembolso préstamo ${loanType}`,
        relatedLoanId: newLoan._id,
    });

    return newLoan;
};

// Obtener todos los préstamos de un usuario
const getUserLoans = async (userId) => {
    return await Loan.find({ userId }).sort({ createdAt: -1 });
};

// Obtener detalles de un préstamo específico
const getLoanDetails = async (userId, loanId) => {
    const loan = await Loan.findOne({ _id: loanId, userId });
    if (!loan) {
        throw new Error('Préstamo no encontrado o no pertenece al usuario.');
    }
    return loan; // Devuelve el objeto completo
};

// Obtener historial de pagos de un préstamo
const getLoanPaymentHistory = async (userId, loanId) => {
    // Primero, verificar que el préstamo existe y pertenece al usuario
    const loan = await Loan.findOne({ _id: loanId, userId });
    if (!loan) {
        throw new Error('Préstamo no encontrado o no pertenece al usuario.');
    }
    // Buscar transacciones de tipo 'pago_prestamo' relacionadas
    return await Transaction.find({ relatedLoanId: loanId, type: 'pago_prestamo' })
                            .sort({ date: -1 });
};

// Realizar un pago a un préstamo (posiblemente desde una cuenta bancaria)
const makeLoanPayment = async (userId, loanId, paymentAmount, paymentAccountId = null) => {
    if (!paymentAmount || paymentAmount <= 0) {
        throw new Error('El monto del pago debe ser positivo.');
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // 1. Buscar el préstamo y verificar propiedad y estado
        const loan = await Loan.findOne({ _id: loanId, userId }).session(session);
        if (!loan) throw new Error('Préstamo no encontrado o no pertenece al usuario.');
        if (loan.status !== 'activo') throw new Error(`El préstamo no está activo (estado: ${loan.status}).`);
        if (loan.remainingBalance <= 0) throw new Error('El préstamo ya está pagado.');


        let paymentAccount = null;
        let transactionDescription = `Pago préstamo ${loan.loanType}`;

        // 2. Si se paga desde una cuenta, procesarla
        if (paymentAccountId) {
            paymentAccount = await Account.findOne({ _id: paymentAccountId, userId }).session(session);
            if (!paymentAccount) throw new Error('Cuenta de pago no encontrada o no pertenece al usuario.');
            if (paymentAccount.balance < paymentAmount) throw new Error('Saldo insuficiente en la cuenta de pago.');

            // Restar de la cuenta de pago
            paymentAccount.balance -= paymentAmount;
            await paymentAccount.save({ session });
            transactionDescription += ` desde cuenta ${paymentAccount.accountNumber}`;
        }

        // 3. Aplicar pago al préstamo
        const actualPayment = Math.min(paymentAmount, loan.remainingBalance); // No pagar más de lo debido
        loan.remainingBalance -= actualPayment;

        // 4. Actualizar estado si se paga completamente
        if (loan.remainingBalance <= 0) {
            loan.remainingBalance = 0; // Asegurar que no quede negativo
            loan.status = 'pagado';
             transactionDescription += ' (Pago final)';
        }
        await loan.save({ session });

        // 5. Registrar la transacción
        await Transaction.create([{
            userId,
            type: 'pago_prestamo',
            amount: actualPayment, // Registrar el monto efectivamente aplicado
            description: transactionDescription,
            relatedLoanId: loan._id,
            relatedAccountId: paymentAccountId, // Vincular cuenta de origen si existe
        }], { session });

        // 6. Confirmar transacción de la base de datos
        await session.commitTransaction();
        return { message: 'Pago realizado con éxito.', remainingBalance: loan.remainingBalance, status: loan.status };

    } catch (error) {
        await session.abortTransaction();
        console.error("Error en pago de préstamo:", error);
        throw error; // Re-lanzar para el controlador
    } finally {
        session.endSession();
    }
};


module.exports = {
    createLoan,
    getUserLoans,
    getLoanDetails,
    getLoanPaymentHistory,
    makeLoanPayment,
};