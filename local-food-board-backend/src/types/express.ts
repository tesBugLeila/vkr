import { Request } from 'express';

/**
 * Расширенный интерфейс запроса Express
 * Добавляет поле user для аутентифицированных запросов
 * Используется в контроллерах, где нужен доступ к данным текущего пользователя
 */


export interface AuthRequest extends Request {
  user?: {
    id: string;
    phone?: string;
    role?: string;
  };
}