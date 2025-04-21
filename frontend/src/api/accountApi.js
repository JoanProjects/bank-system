// frontend/src/api/accountApi.js
import axiosInstance from './axiosConfig';

const API_URL = '/accounts'; // Base URL for account endpoints

// Obtener todas las cuentas del usuario logueado
const getAccounts = async () => {
    try {
        const response = await axiosInstance.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching accounts:", error.response?.data || error.message);
        throw error.response?.data?.message || 'Error al obtener las cuentas';
    }
};

// Crear una nueva cuenta
const createAccount = async (accountData) => {
    // accountData podría ser { accountType: 'ahorro' | 'corriente', initialBalance: opcional }
    try {
        const response = await axiosInstance.post(API_URL, accountData);
        return response.data;
    } catch (error) {
        console.error("Error creating account:", error.response?.data || error.message);
        throw error.response?.data?.message || 'Error al crear la cuenta';
    }
};

// Obtener balance de una cuenta específica
const getAccountBalance = async (accountId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/${accountId}/balance`);
        return response.data; // Debería devolver { balance, accountNumber, accountType }
    } catch (error) {
        console.error(`Error fetching balance for account ${accountId}:`, error.response?.data || error.message);
        throw error.response?.data?.message || 'Error al obtener el saldo';
    }
};

// Obtener historial de transacciones de una cuenta
const getAccountHistory = async (accountId) => {
     try {
        const response = await axiosInstance.get(`${API_URL}/${accountId}/history`);
        return response.data; // Debería devolver un array de transacciones
    } catch (error) {
        console.error(`Error fetching history for account ${accountId}:`, error.response?.data || error.message);
        throw error.response?.data?.message || 'Error al obtener el historial';
    }
};

// Realizar un depósito
const makeDeposit = async (accountId, amount, description) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/${accountId}/deposit`, { amount, description });
        return response.data; // Devuelve { message, balance }
    } catch (error) {
        console.error(`Error making deposit to account ${accountId}:`, error.response?.data || error.message);
        throw error.response?.data?.message || 'Error al realizar el depósito';
    }
};

// Realizar un retiro
const makeWithdrawal = async (accountId, amount, description) => {
     try {
        const response = await axiosInstance.post(`${API_URL}/${accountId}/withdraw`, { amount, description });
        return response.data; // Devuelve { message, balance }
    } catch (error) {
        console.error(`Error making withdrawal from account ${accountId}:`, error.response?.data || error.message);
        throw error.response?.data?.message || 'Error al realizar el retiro';
    }
};

// Realizar una transferencia
const makeTransfer = async (fromAccountId, toAccountNumber, amount, description) => {
    try {
        // Nota: El endpoint del backend es POST /api/accounts/transfer
        // El backend usa req.user._id para validar la cuenta origen si se le pasa fromAccountId
        const response = await axiosInstance.post(`${API_URL}/transfer`, {
            fromAccountId, // El ID de la cuenta desde la que se transfiere
            toAccountNumber,
            amount,
            description
        });
        return response.data; // Devuelve { message }
    } catch (error) {
        console.error(`Error making transfer from account ${fromAccountId}:`, error.response?.data || error.message);
        throw error.response?.data?.message || 'Error al realizar la transferencia';
    }
};


export default {
    getAccounts,
    createAccount,
    getAccountBalance,
    getAccountHistory,
    makeDeposit,
    makeWithdrawal,
    makeTransfer,
};