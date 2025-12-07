import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { AuthRequest } from '../types/express';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this';

/**
 * Middleware для проверки JWT токена и аутентификации пользователя
 * Добавляет поле `user` к объекту запроса `req` с ID пользователя
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  console.log('--- Начало authMiddleware ---');
  console.log('Заголовки запроса:', req.headers);

  // Получаем заголовок Authorization
  const auth = req.headers.authorization;
  if (!auth) {
    console.warn('Заголовок Authorization отсутствует');
    return res.status(401).json({ error: 'токен отсутствует' });
  }

  // Проверяем формат заголовка: "Bearer <token>"
  const parts = auth.split(' ');
  if (parts.length !== 2) {
    console.warn('Неверный формат заголовка Authorization:', auth);
    return res.status(401).json({ error: 'неверный токен' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    console.warn('Схема Authorization не Bearer:', scheme);
    return res.status(401).json({ error: 'неверный токен' });
  }

  console.log('Получен токен:', token);

  try {
    // Проверяем токен
    const payload: any = jwt.verify(token, JWT_SECRET);
    console.log('Данные токена (payload):', payload);

    // Добавляем поле user к запросу (ID пользователя)
    req.user = { id: payload.id };
    console.log('ID пользователя установлен в запросе:', req.user);

    next();
    console.log('--- Завершение authMiddleware (успех) ---');
  } catch (err) {
    console.error('Ошибка проверки JWT токена:', err);
    return res.status(401).json({ error: 'неверный токен' });
  }
}
