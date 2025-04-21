const authService = require('../services/authService');

// Controlador para registrar un nuevo usuario
const register = async (req, res, next) => {
    try {
        // Llama al servicio para registrar al usuario
        const user = await authService.registerUser(req.body);
        // Envía la respuesta con el usuario creado y el token
        res.status(201).json(user);
    } catch (error) {
        // Pasa el error al middleware de manejo de errores
        res.status(400).json({ message: error.message }); // O usar next(error)
    }
};

// Controlador para iniciar sesión
const login = async (req, res, next) => {
    try {
        // Llama al servicio para autenticar al usuario
        const user = await authService.loginUser(req.body);
        // Envía la respuesta con los datos del usuario y el token
        res.status(200).json(user);
    } catch (error) {
         // Pasa el error al middleware de manejo de errores
        res.status(401).json({ message: error.message }); // O usar next(error)
    }
};

module.exports = { register, login };