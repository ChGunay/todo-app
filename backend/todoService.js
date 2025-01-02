require('dotenv').config();
const amqp = require('amqplib');
const mongoose = require('mongoose');
const Task = require('./models/Task');
const { MONGO_URI } = require('./config/config');

const { io } = require('socket.io-client');

const socket = io('http://localhost:4000', {
  transports: ['websocket', 'polling']
  // Auth eklemek istersek: auth: { token: ... } gibi konfig. 
});

let channel;

async function main() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Todo-Service: MongoDB bağlantısı başarılı.');

    const conn = await amqp.connect(process.env.RABBITMQ_URI || 'amqp://localhost');
    channel = await conn.createChannel();
    await channel.assertQueue('task_queue', { durable: true });

    console.log('Todo-Service: task_queue dinlemesi başladı...');

    channel.consume('task_queue', async (msg) => {
      if (!msg) return;
      let content;
      try {
        content = JSON.parse(msg.content.toString());
      } catch (error) {
        console.error('task_queue JSON parse hatası:', error);
        channel.ack(msg);
        return;
      }

      const { action, data } = content;
      console.log('Task Worker: Mesaj alındı =>', content);

      try {
        if (action === 'create') {

          const newTask = new Task({
            title: data.title,
            description: data.description,
            categories: data.categories,
            user: data.userId,
            assignee: data.assignee || data.userId,
            startDate: data.startDate,
            endDate: data.endDate,
            status: data.status
          });
          await newTask.save();
          console.log('Task oluşturuldu:', newTask._id);

          socket.emit('taskCreated', {
            _id: newTask._id,
            title: newTask.title,
            description: newTask.description,
            status: newTask.status,
            assignee: newTask.assignee,
            // vb. ...
          });
        }

        channel.ack(msg);
      } catch (error) {
        console.error('Task Worker DB işlem hatası:', error);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Todo-Service hata:', error);
    process.exit(1);
  }
}

main();
