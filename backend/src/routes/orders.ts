import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  confirmOrder,
  cancelOrder,
} from '../controllers/orderController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', createOrder);
router.get('/', requireAuth, getOrders);
router.get('/:id', requireAuth, getOrder);
router.patch('/:id/confirm', requireAuth, confirmOrder);
router.patch('/:id/cancel', requireAuth, cancelOrder);

export default router;
