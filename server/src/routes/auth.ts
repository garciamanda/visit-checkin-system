import { Router } from 'express';
import { login, register, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { loginSchema, registerSchema } from '../validation/schemas';
import { authLimiter } from '../middleware/security';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);

router.get('/profile', authenticateToken, getProfile);

export default router;