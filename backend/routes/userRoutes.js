import express from 'express';
import { forgotPassword, loginUser, logoutUser, registerUser, resetPassword, verifyUser } from '../controller/userController.js';
import { isLoggedIn } from '../middlewares/userAuthMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', isLoggedIn, logoutUser);
router.get('/verify/:token', verifyUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;