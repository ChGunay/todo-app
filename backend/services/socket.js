let io;

module.exports = {
  init: (server) => {
    // Socket.IO'yu başlat
    io = require('socket.io')(server, {
      cors: {
        origin: '*', 
      },
    });

    // Bağlantı gerçekleştiğinde
    io.on('connection', (socket) => {
      console.log('Bir kullanıcı bağlandı. Socket ID:', socket.id);

      socket.on('disconnect', () => {
        console.log('Kullanıcı ayrıldı. Socket ID:', socket.id);
      });
    });
  },

  // Projenin diğer yerlerinden io nesnesine erişmek için
  getIO: () => io
};
