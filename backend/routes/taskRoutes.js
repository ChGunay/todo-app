// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken } = require('../middlewares/authMiddleware');

// POST /api/tasks  (Yeni görev oluşturur)
router.post('/', verifyToken, taskController.createTask);

// GET /api/tasks   (Filtreli / filtresiz tüm görevler)
router.get('/', verifyToken, taskController.getAllTasks);

// GET /api/tasks/:taskId
router.get('/:taskId', verifyToken, taskController.getTask);

// PUT /api/tasks/:taskId
router.put('/:taskId', verifyToken, taskController.updateTask);

// DELETE /api/tasks/:taskId
router.delete('/:taskId', verifyToken, taskController.deleteTask);

module.exports = router;
