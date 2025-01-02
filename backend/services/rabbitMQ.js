const amqp = require('amqplib');

let connection;
let channel;

async function connectRabbitMQ() {
  try {

    connection = await amqp.connect(process.env.RABBITMQ_URI || 'amqp://localhost');
    channel = await connection.createChannel();
    console.log('RabbitMQ bağlantısı başarılı.');
    
    await channel.assertQueue('task_queue', { durable: true });
    await channel.assertQueue('user_queue', { durable: true });
  } catch (error) {
    console.error('RabbitMQ bağlantı hatası:', error);
  }
}

function getChannel() {
  return channel;
}

async function publishToQueue(queueName, data) {
  if (!channel) {
    console.error('RabbitMQ kanal bulunamadı. Bağlantı hatası olabilir.');
    return;
  }
  try {
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });
  } catch (error) {
    console.error('Mesaj kuyruk gönderim hatası:', error);
  }
}

module.exports = {
  connectRabbitMQ,
  getChannel,
  publishToQueue,
};
