import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Step 1: Start OAuth with Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google redirects here after login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://originhashhh.vercel.app/?error=google_failed",
  }),
  async (req, res) => {
    try {
      const { emails, displayName } = req.user;
      const email = emails[0].value;
      const name = displayName;

      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        return res.redirect(
          `https://originhashhh.vercel.app/register?email=${encodeURIComponent(
            email
          )}&name=${encodeURIComponent(name)}&error=not_registered`
        );
      }

      const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.redirect("https://originhashhh.vercel.app/dashboard");
    } catch (error) {
      console.error("OAuth error:", error);
      res.redirect("https://originhashhh.vercel.app/?error=oauth_failed");
    }
  }
);

export default router;
