const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const protect = async (req, res, next) => {
    let token;

    // Comprobar si el header Authorization existe y empieza con Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extraer el token (Bearer <token>)
            token = req.headers.authorization.split(' ')[1];

            // Verificar el token usando el secreto
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Encontrar al usuario por el ID del payload del token (sin la contraseña)
            // y adjuntarlo al objeto `req` para usarlo en los controladores
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                 throw new Error('Usuario no encontrado para este token');
            }

            next(); // El usuario está autenticado, continuar al siguiente middleware/controlador
        } catch (error) {
            console.error('Error de autenticación:', error.message);
            res.status(401).json({ message: 'No autorizado, token fallido' });
        }
    }

    // Si no hay token en el header
    if (!token) {
        res.status(401).json({ message: 'No autorizado, no se encontró token' });
    }
};

module.exports = { protect };