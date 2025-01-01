const bcrypt = require('bcrypt');
const User = require('../models/User');


// userController.js
exports.getAllUsers = async (req, res) => {
  try {
    const { email, role } = req.query; 

    let query = {};

    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }


    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Kullanıcı listeleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};


exports.getUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select('-password');
    if(!user){
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Kullanıcı getirme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { password } = req.body;

    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

  
    if(password){
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    res.json({ message: 'Kullanıcı güncellendi.' });
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByIdAndDelete(userId);
    if(!user){
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    res.json({ message: 'Kullanıcı silindi.' });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};
