require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const RED = require('node-red');

const { PORT, MONGO_URI } = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

const { connectRabbitMQ } = require('./services/rabbitMQ');


const socket = require('./services/socket');

const app = express();

// Middleware'ler
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);

app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);


const server = http.createServer(app);


socket.init(server);


const settings = {
  httpAdminRoot: "/red",                
  httpNodeRoot: "/api",                 
  adminAuth: null,
  userDir: __dirname + "/nodered_data",
  flowFile: __dirname + "/nodered_data/flows.json",
};


RED.init(server, settings);


app.use(settings.httpAdminRoot, RED.httpAdmin);
app.use(settings.httpNodeRoot, RED.httpNode);


mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    console.log("MongoDB'ye başarıyla bağlanıldı.");

    await connectRabbitMQ();


    server.listen(PORT, () => {
      console.log(`Sunucu çalışıyor => http://localhost:${PORT}`);
   
      RED.start();
    });
  })
  .catch((err) => {
    console.error('Veritabanına bağlanırken hata oluştu:', err);
  });
