//fileManager.js
const fs = require('fs').promises; //Usa la versión de promesas obligatoriamente
const path = require('path');

//Apunta directamente al archivo de base de datos
const dataPath = path.join(__dirname, 'data', 'tareas.json');

// Helper para leer
const leerTareas = async () => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            //Si el archivo no existe, retorna un arreglo vacío
            return [];
        }
        throw error;
    }
};

// Helper para escribir de forma segura
const guardarTareas = async (tareas) => {
    try {
        await fs.writeFile(dataPath, JSON.stringify(tareas, null, 2));
    } catch (error) {
        throw error;
    }
};

module.exports = { leerTareas, guardarTareas };