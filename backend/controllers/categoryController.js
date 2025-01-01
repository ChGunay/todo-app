const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if(!name){
      return res.status(400).json({ message: 'Kategori ismi gereklidir.' });
    }
    const existing = await Category.findOne({ name });
    if(existing){
      return res.status(400).json({ message: 'Bu kategori zaten var.' });
    }
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Kategori oluşturma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const { name } = req.query;
    let filter = {};

    if (name) {
      filter.name = { $regex: name, $options: 'i' }; 
    }
    const categories = await Category.find(filter);
    res.json(categories);
  } catch (error) {
    console.error('Kategori listeleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findById(categoryId);
    if(!category){
      return res.status(404).json({ message: 'Kategori bulunamadı.' });
    }
    res.json(category);
  } catch (error) {
    console.error('Kategori getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const { name } = req.body;
    const category = await Category.findById(categoryId);
    if(!category){
      return res.status(404).json({ message: 'Kategori bulunamadı.' });
    }
    if(name !== undefined){
      category.name = name;
    }
    await category.save();
    res.json({ message: 'Kategori güncellendi.' });
  } catch (error) {
    console.error('Kategori güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findByIdAndDelete(categoryId);
    if(!category){
      return res.status(404).json({ message: 'Kategori bulunamadı.' });
    }
    res.json({ message: 'Kategori silindi.' });
  } catch (error) {
    console.error('Kategori silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};
