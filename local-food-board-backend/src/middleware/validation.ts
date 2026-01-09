import { Request, Response, NextFunction } from 'express';
import { PostCategory } from '../utils/constants';
import { AppError } from '../utils/AppError';

export function validateRegister(
  req: Request,
  res: Response,
  next: NextFunction
) {
    const { phone, password, name } = req.body;

  if (!phone || !password) {
    return next(new AppError(400, 'Требуются phone и password'));
  }

  if (!name || name.trim().length === 0) {
    return next(new AppError(400, 'Имя пользователя обязательно'));
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

  // Валидация имени
  if (body.name !== undefined) {
    if (typeof body.name !== 'string') {
      return next(new AppError(400, 'Имя должно быть строкой'));
    }

    if (body.name.trim().length === 0) {
      return next(new AppError(400, 'Имя не может быть пустым'));
    }

    if (body.name.length > 100) {
      return next(new AppError(400, 'Имя слишком длинное'));
    }

    
    if (body.name.length < 2) {
      return next(new AppError(400, 'Имя слишком короткое'));
    }
  }

  // Строгая валидация телефона РФ
  if (body.phone !== undefined) {
    if (typeof body.phone !== 'string') {
      return next(new AppError(400, 'Телефон должен быть строкой'));
    }

    if (!/^(?:\+7|8)\d{10}$/.test(body.phone)) {
      return next(
        new AppError(
          400,
          'Телефон должен быть в формате +7XXXXXXXXXX или 8XXXXXXXXXX'
        )
      );
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
    return next(new AppError(400, 'Требуются title и contact'));
  }

  if (title.trim().length === 0) {
    return next(new AppError(400, 'Заголовок не может быть пустым'));
  }

  // Проверка телефона
  const phoneRegex = /^(\+7|8)\d{10}$/;
  if (!phoneRegex.test(contact)) {
    return next(new AppError(400, 'Телефон должен быть в формате +7XXXXXXXXXX или 8XXXXXXXXXX'));
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

  if (body.contact !== undefined) {
    const phoneRegex = /^(\+7|8)\d{10}$/;
    if (!phoneRegex.test(body.contact)) {
      return next(new AppError(400, 'Телефон должен быть в формате +7XXXXXXXXXX или 8XXXXXXXXXX'));
    }
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
