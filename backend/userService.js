require('dotenv').config();
const amqp = require('amqplib');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const { MONGO_URI } = require('./config/config');
const { io } = require('socket.io-client');

const socket = io("http://backend:4000", {
  transports: ["websocket", "polling"],
});

async function main() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("User-Service: MongoDB bağlantısı başarılı.");

    const conn = await amqp.connect(process.env.RABBITMQ_URI || "amqp://localhost");
    const channel = await conn.createChannel();
    await channel.assertQueue("user_queue", { durable: true });

    console.log("User-Service: user_queue dinlemesi başladı...");

    channel.consume("user_queue", async (msg) => {
      if (!msg) return;
      let content;
      try {
        content = JSON.parse(msg.content.toString());
      } catch (error) {
        console.error("user_queue JSON parse hatası:", error);
        channel.ack(msg);
        return;
      }

      const { action, data } = content;
      console.log("User Worker: Mesaj alındı =>", content);

      try {
        if (action === "create") {
          const { email, password, role } = data;
          const existingUser = await User.findOne({ email });
          if (existingUser) {
            console.log("Bu e-posta zaten kayıtlı:", email);
          } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const userRole = role === "admin" ? "admin" : "user";
            const newUser = new User({ email, password: hashedPassword, role: userRole });
            await newUser.save();
            console.log("User oluşturuldu:", newUser.email);

            socket.emit("userCreated", {
              _id: newUser._id,
              email: newUser.email,
              role: newUser.role,
            });
          }
        }

        channel.ack(msg);
      } catch (error) {
        console.error("User Worker DB işlem hatası:", error);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error("User-Service hata:", error);
    process.exit(1);
  }
}

main();
