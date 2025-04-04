const Producto = require('../models/ProductoModel');

exports.createProducto = async (req, res) => {
  try {
    const { nombre, tipo, descripcion, codigo_barras, cantidad, precio_unitario, proveedor_id, fecha_llegada } = req.body;

    // Validación básica
    if (!nombre || !tipo || !codigo_barras || !cantidad || !precio_unitario || !proveedor_id || !fecha_llegada) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: nombre, tipo, codigo_barras, cantidad, precio_unitario, proveedor_id, fecha_llegada' 
      });
    }

    // Verificar si el código de barras ya existe
    const productoExistente = await Producto.getByCodigoBarras(codigo_barras);
    if (productoExistente) {
      return res.status(400).json({ error: 'El código de barras ya está registrado' });
    }

    // Crear el producto
    const producto = await Producto.create({
      nombre,
      tipo,
      descripcion,
      codigo_barras,
      cantidad: parseInt(cantidad),
      precio_unitario: parseFloat(precio_unitario),
      proveedor_id,
      fecha_llegada,
    });

    res.status(201).json(producto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

exports.getAllProductos = async (req, res) => {
  try {
    const productos = await Producto.getAll();
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.getProductoById = async (req, res) => {
  try {
    const producto = await Producto.getById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, descripcion, cantidad, precio_unitario, fecha_llegada } = req.body;

    // Validación básica
    if (!nombre || !tipo || !cantidad || !precio_unitario || !fecha_llegada) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: nombre, tipo, cantidad, precio_unitario, fecha_llegada' 
      });
    }

    // Actualizar el producto (no se permite cambiar proveedor_id ni codigo_barras)
    const producto = await Producto.update(id, {
      nombre,
      tipo,
      descripcion,
      cantidad: parseInt(cantidad),
      precio_unitario: parseFloat(precio_unitario),
      fecha_llegada,
    });

    res.json(producto);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

exports.deleteProducto = async (req, res) => {
  try {
    const deleted = await Producto.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};