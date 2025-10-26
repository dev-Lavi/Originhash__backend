import express from 'express';
const router = express.Router();
import { addUser, deleteUser, getAllUsers } from '../controller/userSections.js';

// Add user
router.post('/add', addUser);

// Delete user
router.delete('/delete', deleteUser);

// Get all users
router.get('/', getAllUsers);

export default router;
