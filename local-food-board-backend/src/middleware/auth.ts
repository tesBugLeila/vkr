import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { AuthRequest } from '../types/express';
import { AppError } from '../utils/AppError';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_key';

/**
 * Middleware для проверки JWT токена и аутентификации пользователя
 * Добавляет поле `user` к объекту запроса `req` с ID пользователя
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const auth = req.headers.authorization;
    
    if (!auth) {
      throw new AppError(401, 'Токен отсутствует');
    }

    const parts = auth.split(' ');
    if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
      throw new AppError(401, 'Неверный формат токена');
    }

    const token = parts[1];
    const payload: any = jwt.verify(token, JWT_SECRET);
    
    req.user = { id: payload.id, phone: payload.phone };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError(401, 'Недействительный токен'));
    }
    next(error);
  }
}