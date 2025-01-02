let io;

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: '*',
      },
    });

    io.on('connection', (clientSocket) => {
      console.log('Bir kullanıcı (veya Worker) bağlandı. Socket ID:', clientSocket.id);

      clientSocket.on('taskCreated', (newTaskData) => {
        console.log('Worker’dan bir "taskCreated" event geldi ->', newTaskData);
        io.emit('taskCreated', newTaskData);
      });

      clientSocket.on('userCreated', (newUserData) => {
        console.log('Worker’dan bir "userCreated" event geldi ->', newUserData);
        io.emit('userCreated', newUserData);
      });

      clientSocket.on('disconnect', () => {
        console.log('Kullanıcı ayrıldı. Socket ID:', clientSocket.id);
      });
    });
  },

  getIO: () => io,
};
