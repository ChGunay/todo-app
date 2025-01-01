const Task = require('../models/Task');
const Category = require('../models/Category');


exports.createTask = async (req, res) => {
  try {
    const { title, description, categories } = req.body;
    const task = new Task({
      title,
      description,
      categories
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
    const tasks = await Task.find().populate('categories');
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
    const { title, description, categories } = req.body;
    const task = await Task.findById(taskId);
    if(!task){
      return res.status(404).json({ message: 'Görev bulunamadı.' });
    }
    if (title !== undefined) {
      task.title = title;
    }
    if (description !== undefined) {
      task.description = description;
    }
    if (categories !== undefined){
      task.categories = categories;
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
