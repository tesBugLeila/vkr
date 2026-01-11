import { Request, Response, NextFunction } from 'express';
import { PostCategory } from '../utils/constants';
import { AppError } from '../utils/AppError';

export function validateRegister(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return next(new AppError(400, 'Требуются телефон и пароль'));
  }

  // Простая валидация телефона
  if (!/^\+?\d{10,15}$/.test(phone)) {
    return next(new AppError(400, 'Некорректный формат телефона'));
  }

  if (password.length < 6) {
    return next(new AppError(400, 'Пароль должен быть минимум 6 символов'));
  }

  

  next();
}

export function validateUserUpdate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const body = req.body;

  // 1. Разрешаем обновлять только поля name и phone
  const allowedFields = ['name', 'phone'];

  const invalidFields = Object.keys(body).filter(
    (key) => !allowedFields.includes(key)
  );

  if (invalidFields.length > 0) {
    return next(
      new AppError(
        400,
        `Недопустимые поля для обновления: ${invalidFields.join(', ')}`
      )
    );
  }

  // 2. Валидация name
  if (body.name !== undefined) {
    if (typeof body.name !== 'string') {
      return next(new AppError(400, 'Имя должно быть строкой'));
    }

    if (body.name.trim().length === 0) {
      return next(new AppError(400, 'Имя не может быть пустым'));
    }

    if (body.name.length > 50) {
      return next(new AppError(400, 'Имя не должно превышать 50 символов'));
    }
  }

  // 3. Валидация phone
  if (body.phone !== undefined) {
    if (typeof body.phone !== 'string') {
      return next(new AppError(400, 'Телефон должен быть строкой'));
    }

    // Проверка формата телефона: 10–15 цифр, может быть с + в начале
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(body.phone)) {
      return next(new AppError(400, 'Некорректный формат телефона'));
    }
  }

  next();
}

export function validatePostCreate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { title, contact } = req.body;

  if (!title || !contact) {
    return next(new AppError(400, 'Требуются заголовок и контакты'));
  }

  if (title.trim().length === 0) {
    return next(new AppError(400, 'Заголовок не может быть пустым'));
  }

  next();
}

export function validatePostUpdate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const body = req.body;

  const allowedFields = [
    'title',
    'description',
    'price',
    'contact',
    'category',
    'district',
    'lat',
    'lon',
    'notifyNeighbors',
    'photos'
  ];

  const invalidFields = Object.keys(body).filter(
    (key) => !allowedFields.includes(key)
  );

  if (invalidFields.length > 0) {
    return next(
      new AppError(400, `Недопустимые поля: ${invalidFields.join(', ')}`)
    );
  }

  if (body.title !== undefined && body.title.trim() === '') {
    return next(new AppError(400, 'Заголовок не может быть пустым'));
  }

  if (body.price !== undefined) {
    const priceNum = Number(body.price);
    if (isNaN(priceNum) || priceNum < 0) {
      return next(new AppError(400, 'Цена должна быть положительным числом'));
    }
  }

  if (body.lat !== undefined) {
    const latNum = Number(body.lat);
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      return next(new AppError(400, 'Широта: от -90 до 90'));
    }
  }

  if (body.lon !== undefined) {
    const lonNum = Number(body.lon);
    if (isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
      return next(new AppError(400, 'Долгота: от -180 до 180'));
    }
  }

  if (body.category !== undefined) {
    const validCategories = Object.values(PostCategory);
    if (!validCategories.includes(body.category)) {
      return next(
        new AppError(
          400,
          `Категория должна быть: ${validCategories.join(', ')}`
        )
      );
    }
  }

  next();
}

