const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const userlogRoutes = require('./routes/userlogRoutes');
const uploadRoutes = require('./routes/uploads'); 

const app = express();

// Configuración de límites aumentados (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware
app.use(cors()); // Permite CORS (para conexiones desde otros dominios)
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Rutas
app.use('/api', userRoutes);
app.use('/user', userlogRoutes);
app.use('/upload', uploadRoutes);

// Iniciar servidor (¡cambia 'localhost' por '0.0.0.0'!)
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor Node.js ejecutándose en:`);
  console.log(`- Local: http://localhost:${PORT}`);
  console.log(`- Red local: http://192.168.15.93:${PORT}`); // Usa tu IP local
});