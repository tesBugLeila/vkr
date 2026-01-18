import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import {
  IUserRegisterRequest,
  IUserLoginRequest,
  IAuthResponse
} from '../types/models';
import { AuthRequest } from '../types/express';
import { AppError } from '../utils/AppError';
import { formatDate } from '../utils/dateFormatter';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_key';

export const usersController = {
  /**
   * Регистрация нового пользователя
   * @param req - Request, тело запроса содержит phone, password и необязательное name
   * @param res - Response
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, password, name } = req.body as IUserRegisterRequest;

      // Проверяем, зарегистрирован ли уже пользователь с таким телефоном
      const exists = await User.findOne({ where: { phone } });
    if (exists) {
        throw new AppError(400, 'Телефон уже зарегистрирован');
      }

      // Хэшируем пароль
      const hashed = await bcrypt.hash(password, 10);

      // Создаем пользователя в базе
      const user = await User.create({
        id: nanoid(),        // уникальный идентификатор
        phone,
        password: hashed,    // сохраняем хэш пароля
        name: name ,
        createdAt: formatDate() // "14.12.2025 15:30"
      });

      // Генерируем JWT для аутентификации
      const token = jwt.sign(
        { 
          id: user.id, 
          phone: user.phone,
           role: user.role
        },
        JWT_SECRET,
        {
          expiresIn: '7d' // токен будет действовать 7 дней
        }
      );

      // Формируем ответ клиенту
      const response: IAuthResponse = {
        user: { 
          id: user.id, 
          phone: user.phone, 
          name: user.name,
          role: user.role
        }, 
        token 
      };

      res.status(201).json(response);
    } 
    catch (error) {
      next(error);
    }
  },



 /**
 * Авторизация (логин) пользователя по номеру телефона и паролю.
 */
async login(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Извлекаем номер телефона и пароль из тела запроса
    const { phone, password } = req.body as IUserLoginRequest;

    // 2. Ищем пользователя в базе данных по номеру телефона
    const user = await User.findOne({ where: { phone } });

    // 3. Проверяем, найден ли пользователь и существует ли у него пароль
    // Если пользователь не найден или пароль отсутствует — считаем данные неверными
    if (!user || !user.password) {
      throw new AppError(401, 'Неверные учетные данные');
    }

    // 4. Сравниваем введённый пароль с хэшированным паролем из базы данных
    // bcrypt.compare возвращает true, если пароли совпадают
    const isValid = await bcrypt.compare(password, user.password);

    // 5. Если пароль не совпадает — возвращаем ошибку авторизации
    if (!isValid) {
      throw new AppError(401, 'Неверные учетные данные');
    }

    // 6. Генерируем JWT-токен
    // В payload токена передаём идентификатор и телефон пользователя
    // Токен действует 7 дней
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role  },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 7. Формируем объект ответа,
    // содержащий токен и минимальную информацию о пользователе
    const response: IAuthResponse = {
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role
      }
    };

    // 8. Отправляем успешный ответ клиенту в формате JSON
    res.json(response);
  } catch (error) {
    // 9. Передаём ошибку в централизованный обработчик ошибок
    next(error);
  }
},

/**
 * Получение данных текущего авторизованного пользователя.
 */
async me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // 1. Проверяем наличие идентификатора пользователя в объекте запроса
    // Если ID отсутствует — пользователь не авторизован
    if (!req.user?.id) {
      throw new AppError(401, 'Не авторизован');
    }

    // 2. Получаем пользователя из базы данных по его ID
    // Возвращаем только необходимые поля
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'phone', 'name', 'createdAt']
    });

    // 3. Если пользователь не найден — возвращаем ошибку 404
    if (!user) {
      throw new AppError(404, 'Пользователь не найден');
    }

    // 4. Отправляем данные пользователя клиенту
    res.json({ user });
  } catch (error) {
    // 5. Передаём ошибку в централизованный обработчик
    next(error);
  }
},



/**
 * Обновление данных текущего авторизованного пользователя.
 */
async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // 1. Проверяем, что пользователь авторизован
    if (!req.user?.id) {
      throw new AppError(401, 'Не авторизован');
    }

    // 2. Извлекаем данные, разрешённые для обновления
    const { name, phone } = req.body;

    // 3. Загружаем пользователя из базы данных по ID
    const user = await User.findByPk(req.user.id);

    // 4. Если пользователь не найден — возвращаем ошибку
    if (!user) {
      throw new AppError(404, 'Пользователь не найден');
    }

    // 5. Обновляем имя, если передано
    if (typeof name !== 'undefined') {
      user.name = name;
    }

    // 6. Обновляем телефон, если передан
    if (typeof phone !== 'undefined') {
      // Проверяем уникальность телефона
      const exists = await User.findOne({ where: { phone } });
      if (exists && exists.id !== user.id) {
        throw new AppError(400, 'Телефон уже зарегистрирован другим пользователем');
      }
      user.phone = phone;
    }

    // 7. Сохраняем изменения в базе данных
    await user.save();

    // 7. Отправляем клиенту обновлённые данные пользователя
    res.json({
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
   
    next(error);
  }
},




/**
 * Получение публичной информации о пользователе по его идентификатору.
 */
async getById(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Получаем идентификатор пользователя из параметров URL
    const { id } = req.params;

    // 2. Загружаем пользователя из базы данных по ID
    // Возвращаем только публичные поля
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'createdAt']
    });

    // 3. Если пользователь не найден — возвращаем ошибку 404
    if (!user) {
      throw new AppError(404, 'Пользователь не найден');
    }

    // 4. Отправляем данные пользователя клиенту
    res.json({ user });
  } catch (error) {
    // 5. Передаём ошибку в централизованный обработчик
    next(error);
  }
}










};
