import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

export const loginAdminOrSuperAdmin = async (req, res) => {
  const { username, password, userId, password1, password2 } = req.body;

  try {
    let user;

    // ✅ SuperAdmin login
    const isSuperAdminLogin =
      typeof userId === "string" && userId.trim() !== "" &&
      typeof password1 === "string" && password1.trim() !== "" &&
      typeof password2 === "string" && password2.trim() !== "";

    if (isSuperAdminLogin) {
      user = await Admin.findOne({ userId, isSuperAdmin: true });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const pass1Match = password1 === user.password1;
      const pass2Match = password2 === user.password2;

      if (!pass1Match || !pass2Match)
        return res.status(401).json({ message: "Invalid credentials" });

    } else if (typeof username === "string" && username.trim() !== "" &&
               typeof password === "string" && password.trim() !== "") {
      // ✅ Admin login
      user = await Admin.findOne({ username, isSuperAdmin: false });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const passMatch = password === user.password;
      if (!passMatch)
        return res.status(401).json({ message: "Invalid credentials" });

    } else {
      // ❌ Missing or incomplete login fields
      return res.status(400).json({ message: "Incomplete login credentials" });
    }

    // ✅ JWT Token generation
    const token = jwt.sign(
      { id: user._id, isSuperAdmin: user.isSuperAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      isSuperAdmin: user.isSuperAdmin,
    });

  } catch (err) {
    console.error("Admin Login Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
