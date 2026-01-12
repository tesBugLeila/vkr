import { Router } from 'express';
import { usersController } from '../controllers/usersController';
import { validateRegister,validateUserUpdate } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';


const router = Router();

/**
 * POST /register
 * 1. authLimiter — ограничивает количество запросов (защита от брутфорса)
 * 2. validateRegister — валидирует входные данные (phone, password, name)
 * 3. usersController.register — выполняет регистрацию пользователя
 */
router.post(
  '/register',
  authLimiter,
  validateRegister,
  usersController.register
);

/**
 * POST /login
 * 1. authLimiter — ограничивает количество попыток логина
 * 2. usersController.login — выполняет авторизацию пользователя
 */
router.post(
  '/login',
  authLimiter,
  usersController.login
);

/**
 * GET /me
 * 1. authMiddleware — проверяет JWT и добавляет user в req
 * 2. usersController.me — возвращает данные текущего пользователя
 */
router.get(
  '/me',
  authMiddleware,
  usersController.me
);

/**
 * PUT /me
 * 1. authMiddleware — проверяет авторизацию пользователя
 * 2. usersController.updateMe — обновляет данные текущего пользователя
 */
router.put(
  '/me',
  authMiddleware,
  validateUserUpdate,
  usersController.updateMe
);

/**
 * GET /:id
 * 1. usersController.getById — возвращает публичную информацию пользователя
 *    по его идентификатору
 */
router.get(
  '/:id',
  usersController.getById
);

export default router;
