import express from 'express';
import { forgotPassword, loginUser, logoutUser, registerUser, resetPassword, verifyUser } from '../controller/userController.js';
import { isLoggedIn } from '../middlewares/userAuthMiddleware.js';
import { getAllCourses } from '../controller/courseController.js';
import { fetchCourseDetails } from '../controller/courseController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', isLoggedIn, logoutUser);
router.get('/verify/:token', verifyUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.get("/courses", getAllCourses); // already exists in admin controller, reuse
router.get("/courses/:courseId", fetchCourseDetails); // show modules + lessons

export default router;