import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AuthRequest } from '../types/express';
import { AppError } from '../utils/AppError';

dotenv.config();

// Секретный ключ для JWT (из .env или значение по умолчанию)
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_key';

/**
 * Middleware для аутентификации пользователя
 * Проверяет JWT токен в заголовке Authorization
 * Добавляет данные пользователя в req.user
 * 
 * Использование:
 * router.post('/posts', authMiddleware, postsController.create)
 * 
 * @param req - Запрос Express (расширенный как AuthRequest)
 * @param res - Ответ Express
 * @param next - Функция для передачи управления следующему middleware
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Получаем заголовок Authorization из запроса
    const auth = req.headers.authorization;
    
    // Если заголовка нет - возвращаем ошибку 401
    if (!auth) {
      throw new AppError(401, 'Токен отсутствует');
    }

    // Разбиваем заголовок на схему и токен
    // Ожидаем формат: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const parts = auth.split(' ');
    
    // Проверяем, что заголовок состоит из двух частей
    if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
      throw new AppError(401, 'Неверный формат токена');
    }

    // Извлекаем сам токен (вторая часть после "Bearer ")
    const token = parts[1];
    
    // Проверяем токен с помощью JWT
    // Если токен невалиден или истёк - выбросится исключение
    const payload: any = jwt.verify(token, JWT_SECRET);
    
    // Добавляем данные пользователя из токена в объект запроса
    // Теперь в контроллерах доступен req.user.id
    req.user = { id: payload.id, phone: payload.phone };
    
    // Передаём управление следующему middleware или контроллеру
    next();
  } catch (error) {
    // Если произошла ошибка JWT (невалидный, истёкший токен и т.д.)
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError(401, 'Недействительный токен'));
    }
    
    // Передаём другие ошибки дальше
    next(error);
  }
}