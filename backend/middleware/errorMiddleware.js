// Middleware para manejar rutas no encontradas (404)
const notFound = (req, res, next) => {
    const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
    res.status(404);
    next(error); // Pasa el error al siguiente middleware (errorHandler)
};

// Middleware general para manejar errores
// Debe definirse DESPUÉS de todas las rutas y otros middlewares
const errorHandler = (err, req, res, next) => {
    // A veces un error puede venir con un statusCode (ej, de Mongoose), usarlo. Si no, es un 500.
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Manejo específico para errores comunes (opcional pero útil)
    // Error de Cast de Mongoose (ID inválido)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        message = `Recurso no encontrado con el ID inválido: ${err.value}`;
        statusCode = 404;
    }

     // Error de Validación de Mongoose
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map(val => val.message).join(', ');
        statusCode = 400;
    }

    // Error de Clave Duplicada de Mongoose (ej: email único)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        message = `El campo '${field}' con valor '${err.keyValue[field]}' ya existe.`;
        statusCode = 400;
    }


    res.status(statusCode).json({
        message: message,
        // Mostrar el stack trace solo si no estamos en producción
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
};

module.exports = { notFound, errorHandler };