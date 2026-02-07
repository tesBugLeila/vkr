import { Request } from 'express';
import { UserRole } from '../utils/constants';

/**
 * Расширенный интерфейс запроса Express для аутентифицированного пользователя
 * 
 * Добавляет поле `user`, которое содержит данные пользователя,
 * извлечённые из JWT токена (например, ID пользователя или другие поля).
 * Поле `user` является опциональным, потому что не каждый запрос может быть аутентифицирован.
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    phone?: string;
    role: string;
    isBlocked?: boolean;
  };
}