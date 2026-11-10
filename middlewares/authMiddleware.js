const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../controllers/authController');

const verificarToken = (req, res, next) => {
    //Extrae la cabecera Authorization
    const authHeader = req.headers['authorization'];
    
    //Valida que exista la cabecera
    if (!authHeader) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    //Extrae el token del formato "Bearer <token>"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Formato de token inválido.' });
    }

    try {
        //Verifica la firma del token
        const decodificado = jwt.verify(token, JWT_SECRET);
        
        //Inserta los datos del usuario en la petición y continua
        req.usuario = decodificado;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

module.exports = verificarToken;