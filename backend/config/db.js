const mongoose = require('mongoose');
require('dotenv').config(); // Asegura que las variables de .env estén disponibles

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error conectando a MongoDB: ${error.message}`);
        process.exit(1); // Detener la aplicación si falla la conexión
    }
};

module.exports = connectDB;