
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Sadece login olmuş kullanıcılar (JWT Token) işlem yapabilsin
router.get('/', verifyToken, userController.getAllUsers);
router.get('/:userId', verifyToken, userController.getUser);
router.put('/:userId', verifyToken, userController.updateUser);
router.delete('/:userId', verifyToken, userController.deleteUser);

module.exports = router;
