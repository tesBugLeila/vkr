import { Router } from 'express';
import { usersController } from '../controllers/usersController';
import { validateRegister } from '../middleware/validation';

const router = Router();

// Регистрация нового пользователя
// Сначала выполняется валидация обязательных полей (phone и password),
// затем вызывается контроллер usersController.register
router.post('/register', validateRegister, usersController.register);

// Вход пользователя (login)
// Валидация не нужна, так как контроллер сам проверяет наличие phone и password
router.post('/login', usersController.login);

export default router;
