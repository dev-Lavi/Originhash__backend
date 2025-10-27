import express from 'express';
const router = express.Router();
import { getUserProfile, updateUserProfile } from '../controller/userSections.js';
import { verifyToken } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

// Get user profile
router.get('/', verifyToken, getUserProfile);

// Update user profile
router.put('/update', upload.single('profilePicture'), updateUserProfile);

export default router;
