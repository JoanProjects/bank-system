// frontend/src/api/loanApi.js
import axiosInstance from './axiosConfig';
const API_URL = '/loans'; // Base URL for loan endpoints

// Obtener todos los préstamos del usuario
const getLoans = async () => {
    try {
        const response = await axiosInstance.get(API_URL);
        return response.data; // Devuelve array de préstamos
    } catch (error) {
        console.error("Error fetching loans:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al obtener los préstamos');
    }
};

// Crear/Solicitar un nuevo préstamo (simplificado)
const createLoan = async (loanData) => {
    // loanData: { loanType, amount, interestRate, term }
    // Nota: En una app real, la tasa podría ser asignada por el backend
    try {
        const response = await axiosInstance.post(API_URL, loanData);
        return response.data; // Devuelve el nuevo préstamo creado
    } catch (error) {
        console.error("Error creating loan:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al solicitar el préstamo');
    }
};

// Obtener detalles de un préstamo específico
const getLoanDetails = async (loanId) => {
     try {
        const response = await axiosInstance.get(`${API_URL}/${loanId}`);
        return response.data; // Devuelve el objeto del préstamo
    } catch (error) {
        console.error(`Error fetching details for loan ${loanId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al obtener detalles del préstamo');
    }
};

 // Obtener historial de pagos de un préstamo
const getLoanPaymentHistory = async (loanId) => {
      try {
        const response = await axiosInstance.get(`${API_URL}/${loanId}/history`);
        return response.data; // Devuelve array de transacciones de pago
    } catch (error) {
        console.error(`Error fetching payment history for loan ${loanId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al obtener historial de pagos');
    }
};

 // Realizar pago de préstamo
const makeLoanPayment = async (loanId, amount, paymentAccountId) => {
    // paymentAccountId es opcional en el backend, pero lo requeriremos en el frontend para claridad
    if (!paymentAccountId) {
         throw new Error('Se requiere seleccionar una cuenta de origen para el pago.');
    }
     try {
        const response = await axiosInstance.post(`${API_URL}/${loanId}/pay`, { amount, paymentAccountId });
        return response.data; // Devuelve { message, remainingBalance, status }
    } catch (error) {
        console.error(`Error making payment for loan ${loanId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al realizar el pago del préstamo');
    }
};


export default {
    getLoans,
    createLoan,
    getLoanDetails,
    getLoanPaymentHistory,
    makeLoanPayment
};