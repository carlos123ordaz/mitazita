import { Router } from 'express';
import multer from 'multer';
import { uploadPhoto } from '../controllers/uploadController';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Solo se permiten imágenes'));
      return;
    }
    cb(null, true);
  },
});

router.post('/photo', upload.single('photo'), uploadPhoto);

export default router;
