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




/**
 * Middleware для валидации данных при обновлении поста
 * Проверяет что:
 * 1. Обновляются только разрешенные поля
 * 2. Значения имеют правильный тип
 * 3. Обязательные поля не пустые
 */
export function validatePostUpdate(req: Request, res: Response, next: NextFunction) {
  const body = req.body;
  
  // Список разрешенных полей для обновления
  const allowedFields = [
    'title', 'description', 'price', 'contact',
    'category', 'district', 'lat', 'lon', 
    'notifyNeighbors', 'photos'
  ];
  
  // Проверяем, что обновляются только разрешенные поля
  const invalidFields = Object.keys(body).filter(
    key => !allowedFields.includes(key)
  );
  
  if (invalidFields.length > 0) {
    console.warn(`Валидация обновления поста не пройдена: недопустимые поля - ${invalidFields.join(', ')}`);
    return res.status(400).json({ 
      error: `Недопустимые поля: ${invalidFields.join(', ')}`,
      allowedFields,
      message: 'Можно обновлять только следующие поля: заголовок, описание, цена, контакт, категория, район, широта, долгота, уведомление соседей, фото'
    });
  }
  
  // Проверяем обязательные поля, если они переданы
  if (body.title !== undefined && body.title.trim() === '') {
    console.warn('Валидация обновления поста не пройдена: заголовок не может быть пустым');
    return res.status(400).json({ 
      error: 'Заголовок не может быть пустым',
      message: 'Пожалуйста, укажите непустой заголовок'
    });
  }
  
  if (body.contact !== undefined && body.contact.trim() === '') {
    console.warn('Валидация обновления поста не пройдена: контакт не может быть пустым');
    return res.status(400).json({ 
      error: 'Контакт не может быть пустым',
      message: 'Пожалуйста, укажите контактные данные (телефон)'
    });
  }
  
  // Проверяем числовые поля
  if (body.price !== undefined) {
    const priceNum = Number(body.price);
    if (isNaN(priceNum)) {
      console.warn('Валидация обновления поста не пройдена: цена должна быть числом');
      return res.status(400).json({ 
        error: 'Цена должна быть числом',
        message: 'Пожалуйста, укажите цену в числовом формате'
      });
    }
    if (priceNum < 0) {
      console.warn('Валидация обновления поста не пройдена: цена не может быть отрицательной');
      return res.status(400).json({ 
        error: 'Цена не может быть отрицательной',
        message: 'Цена должна быть положительным числом или нулем'
      });
    }
  }
  
  if (body.lat !== undefined && isNaN(Number(body.lat))) {
    console.warn('Валидация обновления поста не пройдена: широта должна быть числом');
    return res.status(400).json({ 
      error: 'Широта должна быть числом',
      message: 'Пожалуйста, укажите корректную широту в числовом формате'
    });
  }
  
  if (body.lon !== undefined && isNaN(Number(body.lon))) {
    console.warn('Валидация обновления поста не пройдена: долгота должна быть числом');
    return res.status(400).json({ 
      error: 'Долгота должна быть числом',
      message: 'Пожалуйста, укажите корректную долготу в числовом формате'
    });
  }
  
  // Проверяем координаты на допустимые значения
  if (body.lat !== undefined) {
    const latNum = Number(body.lat);
    if (latNum < -90 || latNum > 90) {
      console.warn('Валидация обновления поста не пройдена: широта вне диапазона');
      return res.status(400).json({ 
        error: 'Широта вне допустимого диапазона',
        message: 'Широта должна быть в диапазоне от -90 до 90 градусов'
      });
    }
  }
  
  if (body.lon !== undefined) {
    const lonNum = Number(body.lon);
    if (lonNum < -180 || lonNum > 180) {
      console.warn('Валидация обновления поста не пройдена: долгота вне диапазона');
      return res.status(400).json({ 
        error: 'Долгота вне допустимого диапазона',
        message: 'Долгота должна быть в диапазоне от -180 до 180 градусов'
      });
    }
  }
  
  // Проверяем категорию (если передана)
  if (body.category !== undefined) {
    const validCategories = ['other', 'pies', 'jams', 'vegetables', 'dairy', 'meat', 'bakery'];
    if (!validCategories.includes(body.category)) {
      console.warn(`Валидация обновления поста не пройдена: недопустимая категория - ${body.category}`);
      return res.status(400).json({ 
        error: 'Недопустимая категория',
        validCategories,
        message: `Пожалуйста, выберите категорию из списка: ${validCategories.join(', ')}`
      });
    }
  }
  
  // Проверяем поле уведомления соседей
  if (body.notifyNeighbors !== undefined) {
    const notifyValue = body.notifyNeighbors;
    if (typeof notifyValue !== 'boolean' && 
        notifyValue !== 'true' && 
        notifyValue !== 'false' &&
        notifyValue !== 0 && 
        notifyValue !== 1) {
      console.warn(`Валидация обновления поста не пройдена: некорректное значение для уведомления соседей - ${notifyValue}`);
      return res.status(400).json({ 
        error: 'Некорректное значение для уведомления соседей',
        message: 'Укажите true/false для уведомления соседей'
      });
    }
  }
  
  // Проверяем массив фото (если передан)
  if (body.photos !== undefined) {
    if (typeof body.photos === 'string') {
      try {
        const parsed = JSON.parse(body.photos);
        if (!Array.isArray(parsed)) {
          throw new Error('Не является массивом');
        }
        // Проверяем что все элементы - строки
        const invalidPhotos = parsed.filter((photo: any) => typeof photo !== 'string');
        if (invalidPhotos.length > 0) {
          console.warn('Валидация обновления поста не пройдена: некорректный формат фото');
          return res.status(400).json({ 
            error: 'Некорректный формат массива фото',
            message: 'Массив фото должен содержать только строки (URL изображений)'
          });
        }
      } catch (error) {
        console.warn('Валидация обновления поста не пройдена: некорректный JSON для фото');
        return res.status(400).json({ 
          error: 'Некорректный JSON для массива фото',
          message: 'Пожалуйста, передайте массив фото в формате JSON строки или оставьте поле пустым'
        });
      }
    } else if (!Array.isArray(body.photos)) {
      console.warn('Валидация обновления поста не пройдена: фото должно быть массивом или JSON строкой');
      return res.status(400).json({ 
        error: 'Некорректный тип данных для фото',
        message: 'Поле photos должно быть массивом или JSON строкой'
      });
    }
  }
  
  console.log('Валидация обновления поста пройдена успешно');
  next();
}