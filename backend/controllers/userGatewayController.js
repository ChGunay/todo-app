const { publishToQueue } = require('../services/rabbitMQ');

exports.createUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const payload = {
      action: 'create',
      data: { email, password, role }
    };

    console.log('createUser payload:', payload);
    await publishToQueue('user_queue', payload);
    return res.status(202).json({ message: 'Kullanıcı oluşturma isteği kuyruğa eklendi.' });
  } catch (error) {
    console.error('createUser hata:', error);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
};


