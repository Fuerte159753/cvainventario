const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const userlogRoutes = require('./routes/userlogRoutes')
const uploadRoutes = require('./routes/uploads'); 

const app = express();
// Configuración de límites aumentados (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configuración específica para body-parser (por si acaso)
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());


app.use('/uploads', express.static('uploads'));
// Rutas
app.use('/api', userRoutes);
app.use('/user', userlogRoutes);
app.use('/upload', uploadRoutes); //ruta para manejar imágenes


// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});