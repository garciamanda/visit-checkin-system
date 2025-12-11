import { Router } from 'express';
import { 
  createVisitor, 
  checkOutVisitor, 
  getActiveVisitors, 
  getAllVisitors,
  getVisitorById,
  cancelVisit
} from '../controllers/visitorController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { visitorSchema, checkoutSchema } from '../validation/schemas';
import { sanitizeInput } from '../middleware/security';

const router = Router();

router.use(authenticateToken, sanitizeInput);

router.post('/', validate(visitorSchema), createVisitor);
router.get('/active', getActiveVisitors);
router.get('/', getAllVisitors);
router.get('/:id', getVisitorById);
router.patch('/:id/checkout', validate(checkoutSchema), checkOutVisitor);
router.patch('/:id/cancel', validate(checkoutSchema), cancelVisit);

export default router;