import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authMiddleware } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Все роуты требуют админских прав
router.use(authMiddleware, adminAuth);

// Управление пользователями
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserDetails);
router.patch('/users/:id/block', adminController.toggleBlockUser);
router.delete('/users/:id', adminController.deleteUser);

// Управление жалобами
router.get('/reports', adminController.listReports);
router.patch('/reports/:id', adminController.updateReport);

// Статистика
router.get('/stats', adminController.getStats);

export default router;
