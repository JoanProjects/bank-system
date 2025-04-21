const mongoose = require('mongoose');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const User = require('../models/User'); // Necesario para buscar usuario por ID

// Función auxiliar para generar un número de cuenta único (simplificado)
const generateAccountNumber = async () => {
    let accountNumber;
    let isUnique = false;
    while (!isUnique) {
        // Genera un número de 10 dígitos (ejemplo simple)
        accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        const existingAccount = await Account.findOne({ accountNumber });
        if (!existingAccount) {
            isUnique = true;
        }
    }
    return accountNumber;
};

// Crear una nueva cuenta para un usuario
const createAccount = async (userId, accountData) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    const accountNumber = await generateAccountNumber();
    const newAccount = await Account.create({
        userId,
        accountNumber,
        accountType: accountData.accountType || 'ahorro', // Valor por defecto
        balance: accountData.initialBalance || 0, // Permitir saldo inicial opcional
    });
    return newAccount;
};

// Obtener todas las cuentas de un usuario
const getUserAccounts = async (userId) => {
    return await Account.find({ userId });
};

// Obtener detalles (saldo) de una cuenta específica del usuario
const getAccountBalance = async (userId, accountId) => {
    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
        throw new Error('Cuenta no encontrada o no pertenece al usuario');
    }
    // Devolver solo el saldo o el objeto cuenta completo según necesidad
    return { balance: account.balance, accountNumber: account.accountNumber, accountType: account.accountType };
};

// Obtener historial de transacciones de una cuenta
const getAccountHistory = async (userId, accountId) => {
    // Verificar que la cuenta pertenece al usuario primero
    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
        throw new Error('Cuenta no encontrada o no pertenece al usuario');
    }
    // Buscar transacciones relacionadas con esa cuenta y ordenar por fecha descendente
    return await Transaction.find({ relatedAccountId: accountId })
                            .sort({ date: -1 }); // Más recientes primero
};

// Realizar un depósito (¡Usar sesiones para operaciones complejas!)
const makeDeposit = async (userId, accountId, amount, description) => {
    if (amount <= 0) throw new Error('El monto del depósito debe ser positivo');

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const account = await Account.findOne({ _id: accountId, userId }).session(session);
        if (!account) throw new Error('Cuenta no encontrada o no pertenece al usuario');

        account.balance += amount;
        await account.save({ session });

        const transaction = await Transaction.create([{
            userId,
            type: 'deposito',
            amount,
            description: description || 'Depósito en cuenta',
            relatedAccountId: accountId,
        }], { session });

        await session.commitTransaction();
        return { account, transaction: transaction[0] };
    } catch (error) {
        await session.abortTransaction();
        throw error; // Re-lanzar el error
    } finally {
        session.endSession();
    }
};

// Realizar un retiro (¡Usar sesiones!)
 const makeWithdrawal = async (userId, accountId, amount, description) => {
    if (amount <= 0) throw new Error('El monto del retiro debe ser positivo');

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const account = await Account.findOne({ _id: accountId, userId }).session(session);
        if (!account) throw new Error('Cuenta no encontrada o no pertenece al usuario');
        if (account.balance < amount) throw new Error('Saldo insuficiente');

        account.balance -= amount;
        await account.save({ session });

         const transaction = await Transaction.create([{
            userId,
            type: 'retiro',
            amount,
            description: description || 'Retiro de cuenta',
            relatedAccountId: accountId,
        }], { session });

        await session.commitTransaction();
        return { account, transaction: transaction[0] };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// Realizar una transferencia (¡Sesiones imprescindibles!)
const makeTransfer = async (userId, fromAccountId, toAccountNumber, amount, description) => {
     if (amount <= 0) throw new Error('El monto de la transferencia debe ser positivo');

     const session = await mongoose.startSession();
     session.startTransaction();
     try {
        // Obtener cuenta origen y verificar saldo y pertenencia
        const fromAccount = await Account.findOne({ _id: fromAccountId, userId }).session(session);
        if (!fromAccount) throw new Error('Cuenta origen no encontrada o no pertenece al usuario');
        if (fromAccount.balance < amount) throw new Error('Saldo insuficiente en cuenta origen');

        // Obtener cuenta destino
        const toAccount = await Account.findOne({ accountNumber: toAccountNumber }).session(session);
        if (!toAccount) throw new Error('Cuenta destino no encontrada');
        if (fromAccount.accountNumber === toAccount.accountNumber) throw new Error('No se puede transferir a la misma cuenta');


        // Realizar operaciones
        fromAccount.balance -= amount;
        toAccount.balance += amount;

        await fromAccount.save({ session });
        await toAccount.save({ session });

        // Registrar ambas transacciones (salida y entrada)
        const transactions = await Transaction.create([
            {
                userId: fromAccount.userId, // Usuario que realiza la transferencia
                type: 'transferencia_salida',
                amount,
                description: description || `Transferencia a ${toAccountNumber}`,
                relatedAccountId: fromAccount._id,
                fromAccount: fromAccount.accountNumber,
                toAccount: toAccount.accountNumber,
            },
             {
                userId: toAccount.userId, // Usuario que recibe
                type: 'transferencia_entrada',
                amount,
                description: description || `Transferencia desde ${fromAccount.accountNumber}`,
                relatedAccountId: toAccount._id,
                fromAccount: fromAccount.accountNumber,
                toAccount: toAccount.accountNumber,
            }
        ], {
             session: session, // Pasamos la sesión
             ordered: true  
           }
        );

        await session.commitTransaction();
        return { fromAccount, toAccount, transactions };

     } catch (error) {
        await session.abortTransaction();
        throw error;
     } finally {
        session.endSession();
     }
};


module.exports = {
    createAccount,
    getUserAccounts,
    getAccountBalance,
    getAccountHistory,
    makeDeposit,
    makeWithdrawal,
    makeTransfer,
};