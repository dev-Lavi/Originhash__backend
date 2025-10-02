
import express from "express";
import upload from "../middlewares/upload.js";
import { createCourse, getAllCourses, deleteCourse, fetchCourseDetails } from "../controller/courseController.js";
import { addModule, addLessonToModule } from "../controller/moduleController.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";
import { deleteModule } from "../controller/moduleController.js";
import {loginAdminOrSuperAdmin} from "../controller/adminController.js";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/login", loginAdminOrSuperAdmin);
router.post('/course', verifyAdmin, upload.single('thumbnail'), createCourse);
router.get('/courses', getAllCourses);
router.delete('/course/:id', verifyAdmin, deleteCourse);

router.post('/course/addModules/:id', addModule);
router.get('/course/modules/fetchCourseDetails/:id', fetchCourseDetails);

// IMPORTANT: this uses multer to handle the 'videoFile' field
router.post('/course/module/addLesson/:moduleId', upload.single('videoFile'), addLessonToModule);
router.delete('/course/:courseId/module/:moduleId', deleteModule);

export default router;
