// controllers/taskController.js
const Task = require('../models/Task');
const Category = require('../models/Category');

exports.createTask = async (req, res) => {
  try {
    const { title, description, categories, status, assignee, startDate, endDate } = req.body;
    const userId = req.user.userId; // token'dan gelen, görevi oluşturan kişi
    


    const task = new Task({
      title,
      description,
      categories,
      user: userId,       
      assignee: assignee ? assignee : userId, // assignee yoksa oluşturan kişi varsayılan olarak atanır          
      startDate,
      endDate,
      status               // 'todo', 'inProgress', 'done'
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

    // Filtreleme parametrelerini alalım
    const {
      title,
      status,
      assignee,
      categoryId,
      startDateMin,
      startDateMax,
      endDateMin,
      endDateMax
    } = req.query;

    // Normalde user rolündeki kullanıcı sadece kendi oluşturduğu task'ları görebilsin:
    let filter = role !== 'admin' ? { assignee: userId } : {};

    // title filtre
    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }
    // status filtre
    if (status) {
      filter.status = status;
    }
    // assignee filtre
    if (assignee) {
      filter.assignee = assignee; // (user _id)
    }
    // categoryId filtre
    if (categoryId) {
      filter.categories = categoryId; 
    }
    // tarih filtre (startDate aralığı)
    if (startDateMin || startDateMax) {
      filter.startDate = {};
      if (startDateMin) {
        filter.startDate.$gte = new Date(startDateMin);
      }
      if (startDateMax) {
        filter.startDate.$lte = new Date(startDateMax);
      }
    }
    // tarih filtre (endDate aralığı)
    if (endDateMin || endDateMax) {
      filter.endDate = {};
      if (endDateMin) {
        filter.endDate.$gte = new Date(endDateMin);
      }
      if (endDateMax) {
        filter.endDate.$lte = new Date(endDateMax);
      }
    }

    const tasks = await Task.find(filter)
      .populate('categories')
      .populate('user', 'email')
      .populate('assignee', 'email');

    res.json(tasks);
  } catch (error) {
    console.error('Görev listeleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

exports.getTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findById(taskId)
      .populate('categories')
      .populate('assignee', 'email');
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
    const { title, description, categories, status, assignee, startDate, endDate } = req.body;
    const { userId, role } = req.user;

    const task = await Task.findById(taskId);
    if(!task){
      return res.status(404).json({ message: 'Görev bulunamadı.' });
    }

    // admin değilse ve bu görevi oluşturan kişi değilse güncelleyemez
    if (role !== 'admin' && task.user.toString() !== userId) {
      return res.status(403).json({ message: 'Bu görevi güncelleme yetkiniz yok.' });
    }

    if (title !== undefined)       task.title = title;
    if (description !== undefined) task.description = description;
    if (categories !== undefined)  task.categories = categories;
    if (status !== undefined)      task.status = status;
    if (assignee !== undefined)    task.assignee = assignee;
    if (startDate !== undefined)   task.startDate = startDate;
    if (endDate !== undefined)     task.endDate = endDate;

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
