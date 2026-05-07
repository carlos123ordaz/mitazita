import { Router } from 'express';
import multer from 'multer';
import {
  getActiveProducts,
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  toggleProduct,
  deleteProduct,
} from '../controllers/productController';
import { requireAuth } from '../middleware/auth';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) { cb(new Error('Solo imágenes')); return; }
    cb(null, true);
  },
});

router.get('/', getActiveProducts);
router.get('/all', requireAuth, getAllProducts);
router.get('/:id', requireAuth, getProduct);
router.post('/', requireAuth, upload.single('image'), createProduct);
router.put('/:id', requireAuth, upload.single('image'), updateProduct);
router.patch('/:id/toggle', requireAuth, toggleProduct);
router.delete('/:id', requireAuth, deleteProduct);

export default router;
