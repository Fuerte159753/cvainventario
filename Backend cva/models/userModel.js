// models/userModel.js
const db = require('../config/db');

class User {
  static getAll(callback) {
    db.query('SELECT * FROM usuarios', callback);
  }

  static getById(id, callback) {
    db.query('SELECT * FROM usuarios WHERE id = ?', [id], callback);
  }

  static create(user, callback) {
    const { nombre, user: username, password } = user;
    db.query(
      'INSERT INTO usuarios (nombre, user, password) VALUES (?, ?, ?)',
      [nombre, username, password],
      callback
    );
  }

  static update(id, user, callback) {
    const { nombre, user: username, password } = user;
    db.query(
      'UPDATE usuarios SET nombre = ?, user = ?, password = ? WHERE id = ?',
      [nombre, username, password, id],
      callback
    );
  }

  static delete(id, callback) {
    db.query('DELETE FROM usuarios WHERE id = ?', [id], callback);
  }
  
}

module.exports = User;