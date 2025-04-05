const express = require('express');
const userlogcontroller = require ('../controllers/userLogController');
const productoController = require('../controllers/productoController');

const router = express.Router();
const jsonParser = express.json({ limit: '50mb' });

router.post('/addFurniture', jsonParser, userlogcontroller.addMueble);
router.get('/Nextid', userlogcontroller.getNextMuebleId);
router.get('/muebles', userlogcontroller.getMueblesConImagenes);
//router.post('/addFurniture', userlogcontroller.addMueble);

router.post('/clients', jsonParser, userlogcontroller.createClient);
router.get('/clients', userlogcontroller.getClients);
router.put('/clients/:id', jsonParser, userlogcontroller.updateClient);
router.delete('/clients/:id', userlogcontroller.deleteClient);

// En tu archivo de rutas (userlogRoutes.js o proveedoresRoutes.js)
router.post('/proveedores', jsonParser, userlogcontroller.addProveedor);
router.get('/proveedores', userlogcontroller.getProveedores);
router.put('/proveedores/:id', jsonParser, userlogcontroller.updateProveedor);
router.delete('/proveedores/:id', userlogcontroller.deleteProveedor);

// Rutas para productos
router.post('/productos', jsonParser, productoController.createProducto);
router.get('/productos', productoController.getAllProductos);
router.get('/productos/:id', productoController.getProductoById);
router.put('/productos/:id', jsonParser, productoController.updateProducto);
router.delete('/productos/:id', productoController.deleteProducto);

module.exports = router;
