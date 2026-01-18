import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { AppError } from '../utils/AppError';
import { UserRole } from '../utils/constants';

/**
 * Middleware для проверки прав администратора
 * Использовать после authMiddleware
 * 
 */
export function adminAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // Проверяем, что пользователь аутентифицирован
  if (!req.user?.id) {
    return next(new AppError(401, 'Требуется аутентификация'));
  }

  // Проверяем роль администратора
  if (req.user.role !== UserRole.ADMIN) {
    return next(new AppError(403, 'Доступ запрещён: требуются права администратора'));
  }

  // Пользователь - админ, разрешаем доступ
  next();
}