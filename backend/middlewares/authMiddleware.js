const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).json({ message: 'Erişim reddedildi. Token gerekli.' });
  }

  const token = authHeader.split(' ')[1];
  if(!token){
    return res.status(401).json({ message: 'Token bulunamadı.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Geçersiz token.' });
  }
};


exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Admin izni gerekli.' });
  }
};

