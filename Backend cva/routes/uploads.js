const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');

const router = express.Router();
const uploadDir = './uploads/mueblescva/';

// Crear la carpeta si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `mueble_${timestamp}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// Ruta para guardar mueble con imágenes
router.post('/addFurniture', upload.array('images', 5), async (req, res) => {
  try {
    const { type, description, evidences } = req.body;

    if (!type || !description) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Guardar mueble en la base de datos
    const [result] = await db.execute(
      'INSERT INTO muebles (type, description) VALUES (?, ?)',
      [type, description]
    );

    const furnitureId = result.insertId;

    // Guardar evidencias en la base de datos
    if (req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const filename = req.files[i].filename;
        const filePath = `uploads/mueblescva/${filename}`;
        const evidenceDescription = evidences ? evidences[i]?.evidenceDescription || '' : '';

        await db.execute(
          'INSERT INTO evidencias (furniture_id, filename, filepath, evidenceDescription) VALUES (?, ?, ?, ?)',
          [furnitureId, filename, filePath, evidenceDescription]
        );
      }
    }

    res.json({ message: 'Mueble guardado exitosamente', furnitureId });

  } catch (error) {
    console.error('Error guardando mueble:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;