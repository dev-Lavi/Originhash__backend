import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
    if (!decoded || decoded.isSuperAdmin === true) {
      return res.status(403).json({ message: 'Only admins can upload videos' });
    }
    req.user = decoded;
    req.adminId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid Token' });
  }
};
