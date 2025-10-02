import jwt from 'jsonwebtoken';
import Admin from "../models/adminModel.js";
import dotenv from 'dotenv';

dotenv.config();

export const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access Denied' });
  }

  console.log("Verifying admin with token");

  try {
    // Decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
    
    // Fetch the complete admin document from database
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    // Check if user is actually an admin (adjust logic based on your admin field)
    if (decoded.isSuperAdmin === true) {
      return res.status(403).json({ message: 'Only regular admins can access this resource' });
    }

    // Set the complete admin document to req.user (consistent with your protect middleware)
    req.user = admin;
    req.adminId = admin._id;
    
    next();
  } catch (err) {
    console.error("Admin verification error:", err);
    return res.status(401).json({ message: 'Invalid Token' });
  }
};
