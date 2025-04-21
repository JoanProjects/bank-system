const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Importar archivos de rutas
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const loanRoutes = require('./routes/loanRoutes'); // <<< IMPORTAR
const cardRoutes = require('./routes/cardRoutes');   // <<< IMPORTAR

// Cargar variables de entorno desde .env
dotenv.config();

// Conectar a la base de datos MongoDB
connectDB();

// Crear la aplicación Express
const app = express();

// Middleware: Habilitar CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Middleware: Parsear body de peticiones como JSON
app.use(express.json());

// Middleware: Rutas de la API
app.get('/', (req, res) => {
    res.send('API del Sistema Bancario Funcionando...');
});

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/loans', loanRoutes); // <<< USAR RUTA
app.use('/api/cards', cardRoutes);   // <<< USAR RUTA


// Middleware: Manejo de errores (Debe ir DESPUÉS de las rutas)
app.use(notFound); // Captura rutas no encontradas (404)
app.use(errorHandler); // Captura todos los demás errores

// Definir el puerto
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
app.listen(PORT, () =>
    console.log(`Servidor corriendo en modo ${process.env.NODE_ENV} en el puerto ${PORT}`)
);