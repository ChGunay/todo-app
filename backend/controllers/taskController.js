const Task = require('../models/Task');
const Category = require('../models/Category');


exports.createTask = async (req, res) => {
  try {
    const { title, description, categories, status } = req.body;

    const userId = req.user.userId;

    const task = new Task({
      title,
      description,
      categories,
      user: userId,
      status // eğer body'de varsa kullan, yoksa default: 'todo'
    });
    await task.save();

    res.status(201).json(task);
  } catch (error) {
    console.error('Görev oluşturma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};


exports.getAllTasks = async (req, res) => {
  try {
    const { role, userId } = req.user;

    let filter = {};
    if (role !== 'admin') {
      filter.user = userId;
    }
    
    const tasks = await Task.find(filter).populate('categories').populate('user', 'email');
    res.json(tasks);
  } catch (error) {
    console.error('Görev listeleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};


exports.getTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findById(taskId).populate('categories');
    if(!task){
      return res.status(404).json({ message: 'Görev bulunamadı.' });
    }
    res.json(task);
  } catch (error) {
    console.error('Görev getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};


exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { title, description, categories, status } = req.body;
    const { userId, role } = req.user;

    const task = await Task.findById(taskId);
    if(!task){
      return res.status(404).json({ message: 'Görev bulunamadı.' });
    }

    if (role !== 'admin' && task.user.toString() !== userId) {
      return res.status(403).json({ message: 'Bu görevi güncelleme yetkiniz yok.' });
    }

    if (title !== undefined) {
      task.title = title;
    }
    if (description !== undefined) {
      task.description = description;
    }
    if (categories !== undefined) {
      task.categories = categories;
    }
    
    if (status !== undefined) {
      task.status = status;
    }

    task.updatedAt = Date.now();
    await task.save();
    res.json(task);
  } catch (error) {
    console.error('Görev güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};



exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findByIdAndDelete(taskId);
    if(!task){
      return res.status(404).json({ message: 'Görev bulunamadı.' });
    }
    res.json({ message: 'Görev silindi.' });
  } catch (error) {
    console.error('Görev silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};
