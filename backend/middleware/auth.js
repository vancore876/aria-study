const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      req.userId = null;
      return next();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.userId = decoded.userId || decoded.id;
    next();
  } catch (err) {
    req.userId = null;
    next();
  }
};

module.exports = authMiddleware;

