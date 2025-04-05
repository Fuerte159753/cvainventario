// controllers/userController.js
const User = require('../models/userModel');
const db = require('../config/db');

exports.login = async (req, res) => {
    const { user, password } = req.body;
    try {
        // Ejecuta la consulta SQL con el pool
        const [results] = await db.query('SELECT * FROM usuarios WHERE user = ? AND password = ?', [user, password]);
        if (results.length === 0) {
             return res.status(401).json({ message: 'Credenciales incorrectas' });
        }
        const usuario = results[0];

        res.json({
            success: true,
            message: 'Login exitoso',
            id: usuario.id 
        });
    } catch (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.getUserProfile = async (req, res) => {
  const id = req.params.id;
  try {
    const [results] = await db.query('SELECT id, nombre, user FROM usuarios WHERE id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const id = req.params.id;
  const { nombre, user } = req.body;
  
  try {
    await db.query('UPDATE usuarios SET nombre = ?, user = ? WHERE id = ?', [nombre, user, id]);
    res.json({ success: true, message: 'Perfil actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  const id = req.params.id;
  const { currentPassword, newPassword } = req.body;
  
  try {
    // Primero verificar la contraseña actual
    const [user] = await db.query('SELECT * FROM usuarios WHERE id = ? AND password = ?', [id, currentPassword]);
    
    if (user.length === 0) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta' });
    }
    
    // Actualizar contraseña
    await db.query('UPDATE usuarios SET password = ? WHERE id = ?', [newPassword, id]);
    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
