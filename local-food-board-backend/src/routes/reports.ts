import { Router } from 'express';
import { reportsController } from '../controllers/reportsController';
import { authMiddleware } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Все роуты требуют аутентификации
router.use(authMiddleware);

// Создать жалобу
router.post('/', apiLimiter, reportsController.create);

// Мои жалобы
router.get('/my', reportsController.myReports);

export default router;
