// middlewares/upload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Directories for different file types
const videoDir = 'uploads/videos/';
const imageDir = 'uploads/images/';

// Create directories if not exist
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.mp4', '.mkv', '.mov'].includes(ext)) {
      cb(null, videoDir);
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      cb(null, imageDir);
    } else {
      cb(new Error('Invalid file type'), null);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 100 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      ['.mp4', '.mkv', '.mov', '.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  },
});

export default upload;
