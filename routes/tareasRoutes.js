const express = require('express');
const router = express.Router();
const fs = require('fs').promises; //Importación de la versión asíncrona (Promesas)
const path = require('path');
const verificarToken = require('../middlewares/authMiddleware');

//Ruta hacia el archivo tareas.json
const dataPath = path.join(__dirname, '../data/tareas.json');

//Función de utilidad (Helper) para leer el archivo de forma asíncrona
const leerTareas = async () => {
    try {
        const data = await fs.readFile(dataPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        //Si el archivo no existe o está vacío, retorna un arreglo vacío
        if (error.code === 'ENOENT') return [];
        throw error;
    }
};

//Función de utilidad (Helper) para sobrescribir el archivo de forma asíncrona
const guardarTareas = async (tareas) => {
    await fs.writeFile(dataPath, JSON.stringify(tareas, null, 2));
};

//GET /tareas: Devuelve todas las tareas
router.get('/', verificarToken, async (req, res, next) => {
    try {
        const tareas = await leerTareas();
        res.json(tareas);
    } catch (error) {
        next(error); //Envía el error al middleware global de server.js
    }
});

//POST /tareas: Agrega una nueva tarea
router.post('/', verificarToken, async (req, res, next) => {
    try {
        const { titulo, descripcion } = req.body;
        
        // Validación para no dejar campos vacíos
        if (!titulo || !descripcion) {
            return res.status(400).json({ error: 'El título y la descripción son obligatorios.' });
        }

        const tareas = await leerTareas();
        const nuevaTarea = {
            id: Date.now().toString(), //Genera un ID único basado en la marca de tiempo
            titulo,
            descripcion,
            estado: 'Pendiente'
        };
        
        tareas.push(nuevaTarea);
        await guardarTareas(tareas);
        
        res.status(201).json({ mensaje: 'Tarea creada', tarea: nuevaTarea });
    } catch (error) {
        next(error);
    }
});

//PUT /tareas/:id: Actualiza una tarea existente
router.put('/:id', verificarToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, estado } = req.body;
        
        const tareas = await leerTareas();
        const index = tareas.findIndex(t => t.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Tarea no encontrada.' });
        }
        
        //Actualiza conservando los valores originales si no se envían unos nuevos
        tareas[index] = { 
            ...tareas[index], 
            titulo: titulo || tareas[index].titulo, 
            descripcion: descripcion || tareas[index].descripcion,
            estado: estado || tareas[index].estado
        };
        
        await guardarTareas(tareas);
        res.json({ mensaje: 'Tarea actualizada', tarea: tareas[index] });
    } catch (error) {
        next(error);
    }
});

//DELETE /tareas/:id: Elimina una tarea
router.delete('/:id', verificarToken, async (req, res, next) => {
    try {
        const { id } = req.params;
        const tareas = await leerTareas();
        
        const tareasFiltradas = tareas.filter(t => t.id !== id);
        
        if (tareas.length === tareasFiltradas.length) {
            return res.status(404).json({ error: 'Tarea no encontrada.' });
        }
        
        await guardarTareas(tareasFiltradas);
        res.json({ mensaje: 'Tarea eliminada correctamente.' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;