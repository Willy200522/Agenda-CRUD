require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// Mostrar configuración (sin mostrar la contraseña)
console.log('🔧 Configuración de base de datos:');
console.log('Host:', process.env.DB_HOST || 'localhost');
console.log('User:', process.env.DB_USER || 'root');
console.log('Database:', process.env.DB_NAME);
console.log('Port:', process.env.DB_PORT || 3306);

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar conexión
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a MySQL exitosa');
        
        // Verificar si la tabla existe
        const [tables] = await connection.execute("SHOW TABLES LIKE 'contactos'");
        if (tables.length === 0) {
            console.log('⚠️ La tabla "contactos" no existe. Créala con:');
            console.log('CREATE TABLE contactos (id INT AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(255) NOT NULL, telefono VARCHAR(20) NOT NULL);');
        } else {
            console.log('✅ Tabla "contactos" encontrada');
        }
        
        connection.release();
    } catch (error) {
        console.error('❌ Error de conexión a MySQL:', error.message);
        console.error('📝 Verifica tu archivo .env y que MySQL esté corriendo');
    }
}

testConnection();

// Rutas
app.get('/contactos', async (req, res) => {
    console.log('🔍 GET /contactos');
    try {
        const [rows] = await pool.execute('SELECT * FROM contactos ORDER BY id DESC');
        console.log(`✅ ${rows.length} contactos encontrados`);
        res.json(rows);
    } catch (error) {
        console.error('❌ Error en GET /contactos:', error.message);
        res.status(500).json({ 
            error: 'Error al obtener contactos',
            details: error.message 
        });
    }
});

app.post('/contactos', async (req, res) => {
    console.log('➕ POST /contactos - Body:', req.body);
    try {
        const { nombre, telefono } = req.body;
        
        if (!nombre || !telefono) {
            console.log('❌ Datos faltantes');
            return res.status(400).json({ error: 'Nombre y teléfono son requeridos' });
        }
        
        const [result] = await pool.execute(
            'INSERT INTO contactos (nombre, telefono) VALUES (?, ?)', 
            [nombre.trim(), telefono.trim()]
        );
        
        const [rows] = await pool.execute(
            'SELECT * FROM contactos WHERE id = ?', 
            [result.insertId]
        );
        
        console.log('✅ Contacto creado:', rows[0]);
        res.json(rows[0]);
    } catch (error) {
        console.error('❌ Error en POST /contactos:', error.message);
        res.status(500).json({ 
            error: 'Error al crear contacto',
            details: error.message 
        });
    }
});

app.delete('/contactos/:id', async (req, res) => {
    const { id } = req.params;
    console.log('🗑️ DELETE /contactos/' + id);
    try {
        const [result] = await pool.execute('DELETE FROM contactos WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            console.log('❌ Contacto no encontrado');
            return res.status(404).json({ error: 'Contacto no encontrado' });
        }
        
        console.log('✅ Contacto eliminado');
        res.sendStatus(204);
    } catch (error) {
        console.error('❌ Error en DELETE /contactos:', error.message);
        res.status(500).json({ 
            error: 'Error al eliminar contacto',
            details: error.message 
        });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});