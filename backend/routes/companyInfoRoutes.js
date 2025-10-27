import express from 'express';
const router = express.Router();
import { updateCompanyInfo, getCompanyInfo } from '../controller/companyInfoController.js';
import upload from '../middlewares/upload.js';

// Update company info
router.post('/update', upload.single('image'), updateCompanyInfo);

// Get company info
router.get('/', getCompanyInfo);

export default router;
