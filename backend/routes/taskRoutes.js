const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken } = require('../middlewares/authMiddleware');
const taskGatewayController = require('../controllers/taskGatewayController');

router.post('/', verifyToken, taskGatewayController.createTask);

//direct db write
//router.post('/', verifyToken, taskController.createTask);
router.get('/', verifyToken, taskController.getAllTasks);
router.get('/:taskId', verifyToken, taskController.getTask);
router.put('/:taskId', verifyToken, taskController.updateTask);
router.delete('/:taskId', verifyToken, taskController.deleteTask);

module.exports = router;
