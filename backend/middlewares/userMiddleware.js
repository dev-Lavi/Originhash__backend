import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const userProtect = async (req, res, next) => {
  let token;

  console.log('Authorization header:', req.headers.authorization);

  // Check if Authorization header has Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      console.log('Extracted token:', token);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_USER);

      // Attach user to request (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }

      next();
    } catch (err) {
      console.error("User auth error:", err);
      return res.status(401).json({ message: "Authentication failed, Please Login Again" });
    }
  } else {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};
