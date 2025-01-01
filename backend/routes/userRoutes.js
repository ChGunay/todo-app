const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/authMiddleware');

// Sadece admin kullanıcılar user CRUD yapabilsin:
router.get('/', verifyToken, isAdmin, userController.getAllUsers);
router.get('/:userId', verifyToken, isAdmin, userController.getUser);
router.put('/:userId', verifyToken, isAdmin, userController.updateUser);
router.delete('/:userId', verifyToken, isAdmin, userController.deleteUser);

module.exports = router;
