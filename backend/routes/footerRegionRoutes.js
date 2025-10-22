import express from 'express';
const router = express.Router();
import upload from '../middlewares/upload.js';
import { 
  updateFooterRegion, 
  getFooterRegion 
} from '../controller/footerRegionController.js';

// Update footer region
// Accepts multiple files with different field names
router.post('/update', upload.any(), updateFooterRegion);

// Get footer region
router.get('/', getFooterRegion);

export default router;
