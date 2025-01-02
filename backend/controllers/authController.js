const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/config');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password){
      return res.status(400).json({ message: 'Email ve şifre gereklidir.' });
    }

    const user = await User.findOne({ email });
    if(!user){
      return res.status(401).json({ message: 'E-posta adresi bulunamadı.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(401).json({ message: 'Yanlış şifre.' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Giriş başarılı.',
      token
    });
  } catch (error) {
    console.error('Login hata:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body; 
    if(!email || !password){
      return res.status(400).json({ message: 'Email ve şifre gereklidir.' });
    }

    const existingUser = await User.findOne({ email });
    if(existingUser){
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = role && (role === 'admin' || role === 'user')
      ? role
      : 'user';

    const newUser = new User({
      email,
      password: hashedPassword,
      role: userRole
    });

    await newUser.save();

    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu.' });
  } catch (error) {
    console.error('Register hata:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};
