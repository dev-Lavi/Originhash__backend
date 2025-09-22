// middlewares/verifySuperAdmin.js
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

export const verifySuperAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header is present and starts with 'Bearer'
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided or invalid format" });
  }

  // Extract token from 'Bearer <token>'
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isSuperAdmin) {
      return res.status(403).json({ message: "Only SuperAdmin allowed" });
    }

    req.user = admin;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
