import { Router } from 'express';
import { postsController } from '../controllers/postsController';
import upload from '../middleware/upload';
import { validatePostCreate,  validatePostUpdate } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', postsController.list);      // Получить список всех постов
router.get('/:id', postsController.getById); // Получить пост по ID

// Protected routes (требуется авторизация)
// Создание поста: сначала проверяем токен, затем загружаем файлы (до 6 фото), затем валидация, затем создание
router.post(
  '/',
  authMiddleware,               // Проверка JWT и установка req.user
  upload.array('photos', 6),    // Загрузка массива файлов с ключом 'photos', максимум 6
  validatePostCreate,           // Валидация обязательных полей title и contact
  postsController.create        // Создание поста в базе
);


//Обновление поста
router.patch(
  '/:id',
  authMiddleware,
  upload.array('photos', 6), // опциональная загрузка новых фото
  validatePostUpdate, // валидация для обновления
  postsController.update );


// Удаление поста (только авторизованный пользователь)
router.delete('/:id', authMiddleware, postsController.remove);

export default router;
