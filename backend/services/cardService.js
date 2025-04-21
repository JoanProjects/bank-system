const mongoose = require('mongoose');
const Card = require('../models/Card');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Función auxiliar para generar número de tarjeta (¡SIMPLIFICADO Y NO SEGURO!)
const generateCardNumber = async () => {
    let cardNumber;
    let isUnique = false;
    while (!isUnique) {
        // Genera un número de 16 dígitos (ejemplo MUY simple)
        cardNumber = Array.from({length: 4}, () => Math.floor(1000 + Math.random() * 9000)).join('');
        const existingCard = await Card.findOne({ cardNumber });
        if (!existingCard) isUnique = true;
    }
    return cardNumber;
};

// Crear una nueva tarjeta
const createCard = async (userId, cardData) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');

    const { cardType, expiryDate, creditLimit, linkedAccountId } = cardData;
    if (!cardType || !expiryDate) throw new Error('Tipo de tarjeta y fecha de expiración son requeridos.');

    const cardNumber = await generateCardNumber();
    let newCardData = { userId, cardNumber, cardType, expiryDate, status: 'activa' };

    if (cardType === 'credito') {
        if (!creditLimit || creditLimit <= 0) throw new Error('Límite de crédito es requerido para tarjetas de crédito.');
        newCardData = { ...newCardData, creditLimit, availableBalance: creditLimit, currentDebt: 0 };
    } else if (cardType === 'debito') {
        if (!linkedAccountId) throw new Error('ID de cuenta vinculada es requerido para tarjetas de débito.');
        const account = await Account.findOne({ _id: linkedAccountId, userId });
        if (!account) throw new Error('Cuenta a vincular no encontrada o no pertenece al usuario.');
        newCardData = { ...newCardData, linkedAccountId };
    } else {
         throw new Error('Tipo de tarjeta inválido.');
    }

    return await Card.create(newCardData);
};

// Obtener todas las tarjetas de un usuario
const getUserCards = async (userId) => {
    // Podríamos querer popular la cuenta vinculada para débito
    return await Card.find({ userId })
                     .populate({ path: 'linkedAccountId', select: 'accountNumber balance' }) // Poblar datos de cuenta débito
                     .sort({ createdAt: -1 });
};

// Obtener detalles de una tarjeta específica
const getCardDetails = async (userId, cardId) => {
    const card = await Card.findOne({ _id: cardId, userId })
                          .populate({ path: 'linkedAccountId', select: 'accountNumber balance' });
    if (!card) {
        throw new Error('Tarjeta no encontrada o no pertenece al usuario.');
    }
    return card;
};

// Obtener historial de transacciones de una tarjeta
 const getCardTransactionHistory = async (userId, cardId) => {
    const card = await Card.findOne({ _id: cardId, userId });
    if (!card) throw new Error('Tarjeta no encontrada o no pertenece al usuario.');

    return await Transaction.find({ relatedCardId: cardId })
                            .sort({ date: -1 });
};

// Realizar un pago a una tarjeta de crédito desde una cuenta
const makeCardPayment = async (userId, cardId, paymentAmount, paymentAccountId) => {
     if (!paymentAmount || paymentAmount <= 0) throw new Error('Monto de pago inválido.');
     if (!paymentAccountId) throw new Error('Se requiere la cuenta de origen para el pago.');

     const session = await mongoose.startSession();
     session.startTransaction();
     try {
        // 1. Buscar tarjeta (crédito, activa) y cuenta de pago
        const card = await Card.findOne({ _id: cardId, userId, cardType: 'credito' }).session(session);
        if (!card) throw new Error('Tarjeta de crédito no encontrada o no pertenece al usuario.');
        if (card.status !== 'activa') throw new Error('La tarjeta no está activa.');
         if (card.currentDebt <= 0) throw new Error('La tarjeta no tiene deuda pendiente.');


        const paymentAccount = await Account.findOne({ _id: paymentAccountId, userId }).session(session);
        if (!paymentAccount) throw new Error('Cuenta de pago no encontrada.');
        if (paymentAccount.balance < paymentAmount) throw new Error('Saldo insuficiente en cuenta de pago.');

         // 2. Procesar pago
         const actualPayment = Math.min(paymentAmount, card.currentDebt); // Pagar máximo la deuda
         paymentAccount.balance -= actualPayment;
         card.currentDebt -= actualPayment;
         card.availableBalance = card.creditLimit - card.currentDebt; // Recalcular disponible

         await paymentAccount.save({ session });
         await card.save({ session });

        // 3. Registrar transacción
         await Transaction.create([{
            userId,
            type: 'pago_tarjeta',
            amount: actualPayment,
            description: `Pago tarjeta crédito ${card.cardNumber.slice(-4)} desde cta ${paymentAccount.accountNumber}`,
            relatedCardId: card._id,
            relatedAccountId: paymentAccountId,
        }], { session });

        await session.commitTransaction();
        return { message: 'Pago de tarjeta realizado con éxito.', card };

     } catch (error) {
        await session.abortTransaction();
        console.error("Error pago tarjeta:", error);
        throw error;
     } finally {
        session.endSession();
     }
};

 // Realizar una compra (simplificado)
 const makePurchase = async (userId, cardId, purchaseAmount, description) => {
     if (!purchaseAmount || purchaseAmount <= 0) throw new Error('Monto de compra inválido.');

     const session = await mongoose.startSession();
     session.startTransaction();
     try {
        const card = await Card.findOne({ _id: cardId, userId }).session(session);
        if (!card) throw new Error('Tarjeta no encontrada.');
        if (card.status !== 'activa') throw new Error('La tarjeta no está activa.');

        let transactionDetails = {
            userId,
            type: 'compra_tarjeta',
            amount: purchaseAmount,
            description: description || `Compra con tarjeta ${card.cardNumber.slice(-4)}`,
            relatedCardId: card._id,
        };

        if (card.cardType === 'credito') {
            if (card.availableBalance < purchaseAmount) throw new Error('Saldo disponible insuficiente en tarjeta de crédito.');
            card.currentDebt += purchaseAmount;
            card.availableBalance -= purchaseAmount;
            await card.save({ session });
        } else { // Débito
            const linkedAccount = await Account.findById(card.linkedAccountId).session(session);
            if (!linkedAccount) throw new Error('Cuenta vinculada no encontrada.');
            if (linkedAccount.balance < purchaseAmount) throw new Error('Saldo insuficiente en cuenta vinculada.');
            linkedAccount.balance -= purchaseAmount;
            await linkedAccount.save({ session });
            transactionDetails.relatedAccountId = linkedAccount._id; // Referenciar cuenta débito
        }

         // Registrar transacción
         await Transaction.create([transactionDetails], { session });

         await session.commitTransaction();
         return { message: 'Compra realizada con éxito.', card }; // Devolver estado actualizado de la tarjeta

     } catch (error) {
         await session.abortTransaction();
         console.error("Error en compra:", error);
         throw error;
     } finally {
        session.endSession();
     }
 };

// Realizar avance de efectivo (solo crédito)
const makeCashAdvance = async (userId, cardId, advanceAmount) => {
    if (!advanceAmount || advanceAmount <= 0) throw new Error('Monto de avance inválido.');

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const card = await Card.findOne({ _id: cardId, userId, cardType: 'credito' }).session(session);
        if (!card) throw new Error('Tarjeta de crédito no encontrada.');
        if (card.status !== 'activa') throw new Error('La tarjeta no está activa.');
        if (card.availableBalance < advanceAmount) throw new Error('Saldo disponible insuficiente para avance.');

        card.currentDebt += advanceAmount;
        card.availableBalance -= advanceAmount;
        await card.save({ session });

        await Transaction.create([{
            userId,
            type: 'avance_efectivo_tarjeta',
            amount: advanceAmount,
            description: `Avance de efectivo tarjeta ${card.cardNumber.slice(-4)}`,
            relatedCardId: card._id,
        }], { session });

        await session.commitTransaction();
        // Aquí iría la lógica para entregar el efectivo (no simulada aquí)
         return { message: 'Avance de efectivo procesado con éxito.', card };

    } catch (error) {
         await session.abortTransaction();
         console.error("Error en avance:", error);
         throw error;
    } finally {
        session.endSession();
    }
};

// Cambiar estado de la tarjeta (Bloquear/Desbloquear/Cancelar)
const updateCardStatus = async (userId, cardId, newStatus) => {
    const validStatuses = ['activa', 'bloqueada', 'cancelada']; // Expirada se manejaría por lógica de fecha
    if (!validStatuses.includes(newStatus)) {
        throw new Error('Estado inválido para la tarjeta.');
    }

    const card = await Card.findOne({ _id: cardId, userId });
    if (!card) throw new Error('Tarjeta no encontrada.');

    // Lógica simple de cambio de estado
    if (card.status === 'expirada' || card.status === 'cancelada') {
        throw new Error(`La tarjeta ya está ${card.status} y no se puede cambiar a ${newStatus}.`);
    }
     if (card.status === newStatus) {
         return { message: `La tarjeta ya está ${newStatus}.`, card };
     }

    card.status = newStatus;
    await card.save();
    return { message: `Tarjeta ${newStatus} con éxito.`, card };
};


module.exports = {
    createCard,
    getUserCards,
    getCardDetails,
    getCardTransactionHistory,
    makeCardPayment,
    makePurchase,
    makeCashAdvance,
    updateCardStatus,
};