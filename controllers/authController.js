const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const usersPath = path.join(__dirname, '../data/usuarios.json');
//Clave secreta estática para desarrollo (en un entorno real iría en un .env)
const JWT_SECRET = 'mi_clave_secreta'; 

const leerUsuarios = async () => {
    try {
        const data = await fs.readFile(usersPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
};

const guardarUsuarios = async (usuarios) => {
    await fs.writeFile(usersPath, JSON.stringify(usuarios, null, 2));
};

//POST /register
const register = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username y password son obligatorios' });
        }

        const usuarios = await leerUsuarios();
        
        //Verifica si el usuario ya existe
        if (usuarios.find(u => u.username === username)) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        //Encriptar contraseña con bcryptjs
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const nuevoUsuario = {
            id: Date.now().toString(),
            username,
            password: hashedPassword //Guardamos el hash, no la contraseña real
        };

        usuarios.push(nuevoUsuario);
        await guardarUsuarios(usuarios);

        res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
    } catch (error) {
        next(error);
    }
};

//POST /login
const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        
        const usuarios = await leerUsuarios();
        const usuario = usuarios.find(u => u.username === username);

        //Verifica si el usuario existe y la contraseña es correcta
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        //Generar Token JWT válido por 1 hora
        const token = jwt.sign({ id: usuario.id, username: usuario.username }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ mensaje: 'Login exitoso', token });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, JWT_SECRET };