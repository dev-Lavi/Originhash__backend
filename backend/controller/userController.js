import User from "../models/userModel.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sendEmail from "../utils/sendEmail.js";
dotenv.config();

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "individual",
    });

    if (!user) {
      return res.status(500).json({
        message: "User not created",
      });
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");

    // Save token in database
    user.verificationToken = token;
    await user.save();

    console.log('Generated token:', token);
    console.log('User saved with token:', user.verificationToken);

    // Make sure the verification link matches your frontend route
    const verificationLink = `https://originhashhh.vercel.app/verify/${token}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your Email - OriginHash",
      html: `<p>Click below to verify your email:</p><a href="${verificationLink}">Verify Email</a>`,
    });

    res.status(200).json({
      message: "User registered successfully. Please check your email to verify your account.",
      success: true,
    });
  } catch (e) {
    console.error('Registration error:', e);
    res.status(500).json({  // Fixed: Added status code
      message: "User not registered",
      success: false,
    });
  }
};

const verifyUser = async (req, res) => {
  try {
    console.log('Request params:', req.params);
    const { token } = req.params;
    console.log('Received token:', token);
    
    if (!token) {
      return res.status(400).json({
        message: "Token is required",
        success: false,
      });
    }

    const user = await User.findOne({ verificationToken: token });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('Stored token:', user.verificationToken);
      console.log('Received token:', token);
      console.log('Tokens match:', user.verificationToken === token);
    }

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
        success: false,
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    console.log('User verified successfully');

    res.status(200).json({ 
      message: "Email verified successfully!",
      success: true,
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      message: "Server error during verification",
      success: false,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Block unverified users
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Email not verified. Please verify your account first.",
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({
        message: `Too many failed attempts. Try again in ${minutesLeft} minute(s).`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock the account if more than 5 attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 60 * 60 * 1000; // lock for 1 hour
        await user.save();
        return res.status(403).json({
          message: "Too many failed attempts. Account locked for 1 hour.",
        });
      }

      await user.save();
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Successful login, reset attempts
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "User logged in successfully",
      user: { id: user._id, name: user.name },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: true,
    });
    return res.status(200).json({
      message: "user loggedout",
    });
  } catch (error) {
    res.status(500).json({
      message: "User not logged out",
      success: false,
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  const resetLink = `https://originhashhh.vercel.app/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Reset Your Password - OriginHash',
    html: `<p>Click below to reset your password:</p><a href="${resetLink}">Reset Password</a>`,
  });

  res.json({ message: 'Password reset email sent' });
};


const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: 'Token expired or invalid' });

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpiry = null;
  await user.save();

  res.json({ message: 'Password reset successful' });
};


export { registerUser, verifyUser, loginUser, logoutUser, forgotPassword, resetPassword };
