import express from 'express';
const router = express.Router();
import upload from '../middlewares/upload.js';
import { 
  updateCoreMenu, 
  getAllCoreMenus,
  getCoreMenuBySno,
  deleteCoreMenu
} from '../controller/coreMenuController.js';

// Create or Update core menu
router.post('/update', upload.any(), updateCoreMenu);

// Get all core menus
router.get('/', getAllCoreMenus);

// Get core menu by SNO
router.get('/:sno', getCoreMenuBySno);

// Delete core menu by SNO
router.delete('/:sno', deleteCoreMenu);

export default router;
