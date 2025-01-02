const { publishToQueue } = require('../services/rabbitMQ');

exports.createTask = async (req, res) => {
  try {
    const { title, description, categories, status, assignee, startDate, endDate } = req.body;
    const userId = req.user.userId;

    const payload = {
      action: 'create',
      data: {
        userId,
        title,
        description,
        categories,
        status,
        assignee,
        startDate,
        endDate
      }
    };

    await publishToQueue('task_queue', payload);

    return res.status(202).json({ message: 'Görev oluşturma isteği kuyruğa eklendi.' });
  } catch (error) {
    console.error('createTask hata:', error);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
};


