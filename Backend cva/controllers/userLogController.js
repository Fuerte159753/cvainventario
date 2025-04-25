const db = require('../config/db');
const path = require('path');
const fs = require('fs').promises;

module.exports.getNextMuebleId = async (req, res) => {
    try {
        const result = await db.execute('SELECT MAX(id) AS lastId FROM muebles');
        if (result && result[0] && result[0][0]) {
            const lastId = result[0][0].lastId || 0;
            res.json({ nextId: lastId + 1 });
        } else {
            res.json({ nextId: 1 });
        }
    } catch (error) {
        console.error('Error obteniendo el último ID:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports.addMueble = async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();
        
        const { idmueble, type, numentrega, description, evidences } = req.body;
        
        // 1. Validar datos de entrada
        if (!idmueble || !type || !numentrega || !description || !evidences || !Array.isArray(evidences)) {
            throw new Error('Datos de entrada inválidos');
        }

        // 2. Insertar el mueble principal usando el idmueble proporcionado
        await connection.query(
            'INSERT INTO muebles (id, tipomueble, numero_de_entrega, descripcionprincipal) VALUES (?, ?, ?, ?)',
            [idmueble, type, numentrega, description]
        );
        
        // 3. Procesar cada evidencia usando el mismo idmueble
        for (const evidence of evidences) {
            try {
                const base64Data = evidence.image.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                const uploadsDir = path.join(__dirname, '../uploads');
                
                // Asegurar que el directorio existe
                await fs.mkdir(uploadsDir, { recursive: true });
                
                const filePath = path.join(uploadsDir, evidence.filename);
                await fs.writeFile(filePath, buffer);
                
                await connection.query(
                    'INSERT INTO recursos (id_mueble, imagen, descripcion) VALUES (?, ?, ?)',
                    [idmueble, `/uploads/${evidence.filename}`, evidence.evidenceDescription]
                );
            } catch (error) {
                console.error(`Error procesando evidencia: ${error}`);
                throw error;
            }
        }

        await connection.commit();
        res.status(201).json({
            success: true,
            message: 'Mueble guardado correctamente',
            muebleId: idmueble  // Devolvemos el mismo ID que recibimos
        });

    } catch (error) {
        console.error('Error al guardar mueble:', error);
        
        if (connection) {
            try {
                await connection.rollback();
                
                // Limpiar archivos subidos en caso de error
                if (req.body.evidences) {
                    for (const evidence of req.body.evidences) {
                        try {
                            const filePath = path.join(__dirname, '../uploads', evidence.filename);
                            await fs.unlink(filePath);
                        } catch (unlinkError) {
                            console.error('Error eliminando archivo:', unlinkError);
                        }
                    }
                }
            } catch (rollbackError) {
                console.error('Error en rollback:', rollbackError);
            }
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Error al guardar el mueble',
            details: error.message
        });
    } finally {
        if (connection) {
            try {
                connection.release();
            } catch (releaseError) {
                console.error('Error liberando conexión:', releaseError);
            }
        }
    }
};

module.exports.getMueblesConImagenes = async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        
        // Obtener todos los muebles con sus imágenes relacionadas
        const [muebles] = await connection.query(`
            SELECT m.id, m.tipomueble, m.numero_de_entrega, m.descripcionprincipal, m.created_at, 
                   r.imagen, r.descripcion as descripcion_evidencia
            FROM muebles m
            LEFT JOIN recursos r ON m.id = r.id_mueble
            ORDER BY m.id
        `);
        
        // Agrupar imágenes por mueble
        const resultado = muebles.reduce((acc, item) => {
            const existente = acc.find(m => m.id === item.id);
            if (existente) {
                if (item.imagen) {
                    existente.evidencias.push({
                        imagen: item.imagen,
                        descripcion: item.descripcion_evidencia
                    });
                }
            } else {
                const nuevoMueble = {
                    id: item.id,
                    type: item.tipomueble,
                    numentrega: item.numero_de_entrega,
                    description: item.descripcionprincipal,
                    created: item.created_at,
                    created: item.created_at,
                    evidencias: item.imagen ? [{
                        imagen: item.imagen,
                        descripcion: item.descripcion_evidencia
                    }] : []
                };
                acc.push(nuevoMueble);
            }
            return acc;
        }, []);
        
        res.json(resultado);
        
    } catch (error) {
        console.error('Error obteniendo muebles:', error);
        res.status(500).json({ error: 'Error al obtener muebles' });
    } finally {
        if (connection) connection.release();
    }
};

// Operaciones CRUD para clientes
module.exports.createClient = async (req, res) => {
    try {
        const { name, lastname, email, phone } = req.body;
        
        // Validación
        if (!name || !lastname || !email || !phone) {
            return res.status(400).json({ 
                error: 'Todos los campos (nombre, apellido, email, teléfono) son requeridos' 
            });
        }

        // Primero obtenemos el próximo ID disponible
        const [idResult] = await db.execute(
            'SELECT IFNULL(MAX(id), 0) + 1 AS nextId FROM clientes'
        );
        const nextId = idResult[0].nextId;

        // Insertamos con el ID explícito
        const [result] = await db.execute(
            'INSERT INTO clientes (id, nombre, apellidos, correo, telefono) VALUES (?, ?, ?, ?, ?)',
            [nextId, name, lastname, email, phone]
        );

        const newClient = {
            id: nextId,
            name,
            lastname,
            email,
            phone
        };

        res.status(201).json(newClient);
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
};
module.exports.getClients = async (req, res) => {
    try {
        const [clients] = await db.execute('SELECT * FROM clientes ORDER BY id ASC');
        res.json(clients);
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
// Actualizar cliente con apellidos
module.exports.updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, lastname, email, phone } = req.body;

        // Validación
        if (!name || !lastname || !email || !phone) {
            return res.status(400).json({ 
                error: 'Todos los campos (nombre, apellido, email, teléfono) son requeridos' 
            });
        }

        const [result] = await db.execute(
            'UPDATE clientes SET nombre = ?, apellidos = ?, correo = ?, telefono = ? WHERE id = ?',
            [name, lastname, email, phone, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        const updatedClient = {
            id,
            name,
            lastname,
            email,
            phone
        };

        res.json(updatedClient);
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports.deleteClient = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute('DELETE FROM clientes WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        res.status(204).send(); // Respuesta exitosa sin contenido
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
// Métodos para proveedores
module.exports.addProveedor = async (req, res) => {
    try {
        const { empresa, nombre, rfc, email, telefono, productos } = req.body;
        
        if (!empresa || !nombre || !email || !telefono || !productos) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const [result] = await db.execute(
            'INSERT INTO proveedores (empresa, nombre, rfc, email, telefono, productos) VALUES (?, ?, ?, ?, ?, ?)',
            [empresa, nombre, rfc, email, telefono, productos]
        );

        res.status(201).json({
            id: result.insertId,
            ...req.body
        });
    } catch (error) {
        console.error('Error al crear proveedor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports.getProveedores = async (req, res) => {
    try {
        const [proveedores] = await db.execute('SELECT * FROM proveedores ORDER BY empresa ASC');
        res.json(proveedores);
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports.updateProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresa, nombre, rfc, email, telefono, productos } = req.body;

        const [result] = await db.execute(
            'UPDATE proveedores SET empresa = ?, nombre = ?, rfc = ?, email = ?, telefono = ?, productos = ? WHERE id = ?',
            [empresa, nombre, rfc, email, telefono, productos, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }

        res.json({ id, ...req.body });
    } catch (error) {
        console.error('Error al actualizar proveedor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports.deleteProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.execute('DELETE FROM proveedores WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar proveedor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
