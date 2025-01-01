const bcrypt = require('bcrypt');
const User = require('../models/User');


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

/**
 * Yeni kullanıcı oluştur (admin)
 */
exports.createUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if(!email || !password){
      return res.status(400).json({ message: 'Email ve şifre gereklidir.' });
    }

    // Bu email zaten var mı?
    const existingUser = await User.findOne({ email });
    if(existingUser){
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Gelen rol admin ya da user olabilir, aksi halde 'user' olsun
    // Bu yaklaşım normal projelerde kullanılmaz, sadece örnektir
    let userRole = 'user';
    if (role === 'admin') {
      userRole = 'admin';
    }

    const newUser = new User({
      email,
      password: hashedPassword,
      role: userRole
    });

    await newUser.save();

    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu.' });
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { password, role } = req.body;

    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // Eğer şifre gönderilmişse bcrypt ile hashleyelim
    if(password){
      user.password = await bcrypt.hash(password, 10);
    }

    // Admin, kullanıcı rolünü de değiştirebilsin
    if (role && (role === 'admin' || role === 'user')) {
      user.role = role;
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
