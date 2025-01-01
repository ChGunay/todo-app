const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');


router.get('/', verifyToken, isAdmin, userController.getAllUsers);
router.get('/:userId', verifyToken, isAdmin, userController.getUser);

router.post('/', verifyToken, isAdmin, userController.createUser);
router.put('/:userId', verifyToken, isAdmin, userController.updateUser);
router.delete('/:userId', verifyToken, isAdmin, userController.deleteUser);

module.exports = router;
