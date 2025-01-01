
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, categoryController.createCategory);
router.get('/', verifyToken, categoryController.getAllCategories);
router.get('/:categoryId', verifyToken, categoryController.getCategory);
router.put('/:categoryId', verifyToken, categoryController.updateCategory);
router.delete('/:categoryId', verifyToken, categoryController.deleteCategory);

module.exports = router;
