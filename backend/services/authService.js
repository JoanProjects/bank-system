const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const registerUser = async (userData) => {
    const { name, email, password } = userData;

    if (!name || !email || !password) {
         throw new Error('Por favor, proporcione nombre, email y contraseña');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('El email ya está registrado');
    }

    const user = await User.create({ name, email, password });

    if (user) {
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        };
    } else {
        throw new Error('Datos de usuario inválidos');
    }
};

const loginUser = async (loginData) => {
    const { email, password } = loginData;

     if (!email || !password) {
         throw new Error('Por favor, proporcione email y contraseña');
    }

    // Buscar usuario e incluir la contraseña para la comparación
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
         return {
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        };
    } else {
         throw new Error('Email o contraseña inválidos');
    }
};

module.exports = { registerUser, loginUser };