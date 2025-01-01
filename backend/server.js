require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const RED = require('node-red');

const { PORT, MONGO_URI } = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

// Middleware'ler
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/categories', categoryRoutes);

// Node-RED entegrasyonu için server oluştur
const server = http.createServer(app);

// Node-RED ayarları
const settings = {
  httpAdminRoot: "/red",                 // Node-RED editör arayüzü
  httpNodeRoot: "/api",                 // Node-RED flow endpointleri
  adminAuth: null,
  userDir: __dirname + "/nodered_data",
  flowFile: __dirname + "/nodered_data/flows.json",
};

// Node-RED'i başlat
RED.init(server, settings);

// Node-RED admin ve node endpoint'lerini kullanıma aç
app.use(settings.httpAdminRoot, RED.httpAdmin);
app.use(settings.httpNodeRoot, RED.httpNode);

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("MongoDB'ye başarıyla bağlanıldı.");
    server.listen(PORT, () => {
      console.log(`Sunucu çalışıyor => http://localhost:${PORT}`);
      // Node-RED başlat
      RED.start();
    });
  })
  .catch((err) => {
    console.error('Veritabanına bağlanırken hata oluştu:', err);
  });
