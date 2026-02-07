import { Router } from 'express';
import { postsController } from '../controllers/postsController';
import upload from '../middleware/upload';
import { validatePostCreate, validatePostUpdate } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';


const router = Router();

/**
 * GET /
 * Получение списка постов с фильтрацией и пагинацией
 * Доступно без авторизации
 */
router.get('/', postsController.list);

/**
 * GET /:id
 * Получение одного поста по идентификатору
 * Доступно без авторизации
 */
router.get('/:id', postsController.getById);


/**
 * GET /user/my-posts
 * Получение всех постов текущего пользователя
 * Требует авторизацию
 */
router.get('/user/my-posts', authMiddleware, postsController.getUserPosts);


/**
 * POST /
 * Создание нового поста
 * Требует авторизацию
 * Поддерживает загрузку до 6 фотографий
 */
router.post(
  '/',
  authMiddleware,                 // Проверка авторизации пользователя
  upload.array('photos', 6),       // Загрузка файлов (поле photos)
  validatePostCreate,              // Валидация входных данных
  postsController.create           // Контроллер создания поста
);

/**
 * PATCH /:id
 * Обновление существующего поста
 * Требует авторизацию
 * Поддерживает загрузку до 6 фотографий
 */
router.patch(
  '/:id',
  authMiddleware,                 // Проверка авторизации
  upload.array('photos', 6),       // Обработка новых фотографий
  validatePostUpdate,              // Валидация данных обновления
  postsController.update           // Контроллер обновления поста
);

/**
 * DELETE /:id
 * Удаление поста
 * Требует авторизацию
 */
router.delete('/:id', authMiddleware, postsController.remove);

export default router;
