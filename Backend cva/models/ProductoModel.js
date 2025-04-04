const db = require('../config/db');

class Producto {
  static async create({ nombre, tipo, descripcion, codigo_barras, cantidad, precio_unitario, proveedor_id, fecha_llegada}) {
    const [result] = await db.execute(
      `INSERT INTO productos 
       (nombre, tipo, descripcion, codigo_barras, cantidad, precio_unitario, proveedor_id, fecha_llegada) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, tipo, descripcion, codigo_barras, cantidad, precio_unitario, proveedor_id, fecha_llegada]
    );
    return this.getById(result.insertId);
  }

  static async getAll() {
    const [rows] = await db.execute(`
      SELECT p.*, pr.empresa as proveedor_empresa, pr.nombre as proveedor_nombre 
      FROM productos p
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      ORDER BY p.nombre ASC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(`
      SELECT p.*, pr.empresa as proveedor_empresa, pr.nombre as proveedor_nombre 
      FROM productos p
      LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
      WHERE p.id = ?
    `, [id]);
    return rows[0];
  }

  static async update(id, { nombre, tipo, descripcion, cantidad, precio_unitario, fecha_llegada}) {
    await db.execute(
      `UPDATE productos SET 
       nombre = ?, tipo = ?, descripcion = ?, cantidad = ?, precio_unitario = ?, 
       fecha_llegada = ?
       WHERE id = ?`,
      [nombre, tipo, descripcion, cantidad, precio_unitario, fecha_llegada, id]
    );
    return this.getById(id);
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM productos WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getByCodigoBarras(codigo_barras) {
    const [rows] = await db.execute('SELECT * FROM productos WHERE codigo_barras = ?', [codigo_barras]);
    return rows[0];
  }
}

module.exports = Producto;