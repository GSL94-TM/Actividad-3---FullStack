const express = require('express');
const app = express();
const PORT = 3000;
const tareasRoutes = require('./routes/tareasRoutes');

//Middleware integrado para poder leer peticiones en formato JSON
app.use(express.json());

const { register, login } = require('./controllers/authController');

// Rutas de Autenticación
app.post('/register', register);
app.post('/login', login);

//Monta el enrutador CRUD bajo el prefijo /tareas
app.use('/tareas', tareasRoutes);

//Ruta inicial de prueba para confirmar que la API funciona
app.get('/', (req, res) => {
    res.json({ mensaje: 'API de Gestión de Tareas funcionando correctamente.' });
});

//Middleware Global para Manejo de Errores
//Intercepta errores de sintaxis (ej. si el cliente envía un JSON mal formado)
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Error detectado:', err.message);
        return res.status(400).json({ 
            error: 'Estructura JSON inválida en la petición.' 
        });
    }
    
    //Captura cualquier otro error interno del servidor
    console.error('Error interno del servidor:', err.stack);
    res.status(500).json({ 
        error: 'Ocurrió un error inesperado en el servidor.' 
    });
});

//Inicialización del servidor escuchando en el puerto 3000
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});