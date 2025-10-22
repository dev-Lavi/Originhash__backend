import express from 'express';
const router = express.Router();
import upload from '../middlewares/upload.js';
import { 
  updateHeaderRegion, 
  getHeaderRegion 
} from '../controller/headerRegionController.js';

// Update header region (use existing upload middleware, accepts up to 6 images)
router.post('/update', upload.array('menuImages', 6), updateHeaderRegion);

// Get header region
router.get('/', getHeaderRegion);

export default router;
