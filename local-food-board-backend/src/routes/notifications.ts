import { Router } from 'express';
import { notificationsController } from '../controllers/notificationsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Все роуты требуют аутентификации
router.use(authMiddleware);

/**
 * GET /api/notifications
 * Получить мои уведомления
 * Query: ?unreadOnly=true - только непрочитанные
 */
router.get('/', notificationsController.getMyNotifications);

/**
 * PATCH /api/notifications/:id/read
 * Отметить уведомление как прочитанное
 */
router.patch('/:id/read', notificationsController.markAsRead);

/**
 * POST /api/notifications/read-all
 * Отметить все как прочитанные
 */
router.post('/read-all', notificationsController.markAllAsRead);

/**
 * DELETE /api/notifications/:id
 * Удалить уведомление
 */
router.delete('/:id', notificationsController.deleteNotification);

/**
 * POST /api/notifications/update-location
 * Обновить геолокацию пользователя
 */
router.post('/update-location', notificationsController.updateLocation);



router.post('/clear-location', notificationsController.clearLocation);

export default router;