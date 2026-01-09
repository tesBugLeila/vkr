import { Router } from 'express';
import { usersController } from '../controllers/usersController';
import { validateRegister , validateUserUpdate} from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, validateRegister, usersController.register);
router.post('/login', authLimiter, usersController.login);
router.get('/me', authMiddleware, usersController.me);
router.put('/me', authMiddleware, validateUserUpdate, usersController.updateMe);
router.get('/:id', usersController.getById);

export default router;