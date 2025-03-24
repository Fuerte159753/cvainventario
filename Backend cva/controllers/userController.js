// controllers/userController.js
const User = require('../models/userModel');
const db = require('../config/db');

exports.getAllUsers = (req, res) => {
  User.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

exports.getUserById = (req, res) => {
  const id = req.params.id;
  User.getById(id, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(results[0]);
  });
};

exports.createUser = (req, res) => {
  const newUser = req.body;
  User.create(newUser, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: results.insertId, ...newUser });
  });
};

exports.updateUser = (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body;
  User.update(id, updatedUser, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id, ...updatedUser });
  });
};

exports.deleteUser = (req, res) => {
  const id = req.params.id;
  User.delete(id, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'User deleted successfully' });
  });
};

exports.login = (req, res) => {
    const { user, password } = req.body;
    // Busca el usuario en la base de datos
    db.query(
      'SELECT * FROM usuarios WHERE user = ? AND password = ?',
      [user, password],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message , hola: 'puta madreeee'});
        }
        if (results.length === 0) {
          return res.status(401).json({ message: 'Credenciales incorrectas' });
        }
        res.json({ message: 'Login exitoso', user: results[0] });
      }
    );
};