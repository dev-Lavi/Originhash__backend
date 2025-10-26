import express from 'express';
const router = express.Router();
import { updateFooter, getFooter } from '../controller/footerController.js';

// Update footer
router.post('/update', updateFooter);

// Get footer
router.get('/', getFooter);

export default router;
