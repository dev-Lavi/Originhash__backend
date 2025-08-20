import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await Admin.findById(decoded.id).select("-password");
      next();
    } catch (err) {
      console.error("Auth error:", err);
      return res.status(401).json({ message: "Authentication failed" });
    }
  } else {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};
