// frontend/src/api/cardApi.js
import axiosInstance from './axiosConfig';
const API_URL = '/cards'; // Base URL for card endpoints

// Obtener todas las tarjetas del usuario
const getCards = async () => {
    try {
        const response = await axiosInstance.get(API_URL);
        return response.data; // Array de objetos de tarjeta
    } catch (error) {
        console.error("Error fetching cards:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al obtener las tarjetas');
    }
};

// Crear/Solicitar una nueva tarjeta
const createCard = async (cardData) => {
    // cardData: { cardType ('credito'/'debito'), expiryDate ('MM/YY'), creditLimit?, linkedAccountId? }
    try {
        const response = await axiosInstance.post(API_URL, cardData);
        return response.data; // Devuelve la nueva tarjeta creada
    } catch (error) {
        console.error("Error creating card:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al solicitar la tarjeta');
    }
};

// Obtener detalles de una tarjeta específica
const getCardDetails = async (cardId) => {
     try {
        const response = await axiosInstance.get(`${API_URL}/${cardId}`);
        return response.data; // Devuelve el objeto de la tarjeta
    } catch (error) {
        console.error(`Error fetching details for card ${cardId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al obtener detalles de la tarjeta');
    }
};

// Obtener historial de transacciones de una tarjeta
const getCardHistory = async (cardId) => {
     try {
        const response = await axiosInstance.get(`${API_URL}/${cardId}/history`);
        return response.data; // Devuelve array de transacciones relacionadas
    } catch (error) {
        console.error(`Error fetching history for card ${cardId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al obtener historial de la tarjeta');
    }
};

// Realizar pago a tarjeta de crédito
const makeCardPayment = async (cardId, amount, paymentAccountId) => {
    if (!paymentAccountId) {
         throw new Error('Se requiere seleccionar una cuenta de origen para el pago.');
    }
    try {
        const response = await axiosInstance.post(`${API_URL}/${cardId}/pay`, { amount, paymentAccountId });
        return response.data; // Devuelve { message, card }
    } catch (error) {
        console.error(`Error making payment for card ${cardId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al realizar el pago de la tarjeta');
    }
};

// Realizar avance de efectivo (solo crédito)
const makeCashAdvance = async (cardId, amount) => {
     try {
        const response = await axiosInstance.post(`${API_URL}/${cardId}/advance`, { amount });
        return response.data; // Devuelve { message, card }
    } catch (error) {
        console.error(`Error making cash advance for card ${cardId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al realizar el avance de efectivo');
    }
};

// Cambiar estado de la tarjeta (ej: bloquear)
const updateCardStatus = async (cardId, status) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/${cardId}/status`, { status });
        return response.data; // Devuelve { message, card }
    } catch (error) {
        console.error(`Error updating status for card ${cardId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al actualizar el estado de la tarjeta');
    }
};

// NOTA: No implementamos la llamada a makePurchase aquí, pero seguiría un patrón similar a advance/payment.

export default {
    getCards,
    createCard,
    getCardDetails,
    getCardHistory,
    makeCardPayment,
    makeCashAdvance,
    updateCardStatus,
};