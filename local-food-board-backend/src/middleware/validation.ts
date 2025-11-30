import { Request, Response, NextFunction } from 'express';

/**
 * Middleware для валидации данных регистрации пользователя
 * Проверяет, что переданы обязательные поля: phone и password
 * Если данные некорректны — возвращает статус 400 с ошибкой
 * Если всё верно — передаёт управление следующему middleware/контроллеру
 */
export function validateRegister(req: Request, res: Response, next: NextFunction) {
  const { phone, password } = req.body;

  if (!phone || !password) {
    console.warn('Валидация регистрации не пройдена: отсутствует phone или password');
    return res.status(400).json({ error: 'phone and password required' });
  }

  console.log('Валидация регистрации пройдена успешно');
  next();
}

/**
 * Middleware для валидации данных при создании поста
 * Проверяет наличие обязательных полей: title и contact
 * Если данных нет — возвращает статус 400 с ошибкой
 * Иначе передаёт управление следующему middleware/контроллеру
 */
export function validatePostCreate(req: Request, res: Response, next: NextFunction) {
  const { title, contact } = req.body;

  if (!title || !contact) {
    console.warn('Валидация создания поста не пройдена: отсутствует title или contact');
    return res.status(400).json({ error: 'title and contact required' });
  }

  console.log('Валидация создания поста пройдена успешно');
  next();
}
