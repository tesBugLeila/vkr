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
import { UserRole } from '../utils/constants';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_key';

export const usersController = {
  /**
   * Регистрация нового пользователя
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, password, name, email } = req.body as IUserRegisterRequest;

      // Проверяем существование телефона
      const exists = await User.findOne({ where: { phone } });
      if (exists) {
        throw new AppError(400, 'Телефон уже зарегистрирован');
      }

      // Хешируем пароль
      const hashed = await bcrypt.hash(password, 10);

      // Создаём пользователя
      const user = await User.create({
        id: nanoid(),
        phone,
        password: hashed,
        name,
        email: email || null,
        role: UserRole.USER,
        isBlocked: false,
        verified: true,
        createdAt: formatDate()
      });

      // Генерируем JWT с ролью
      const token = jwt.sign(
        { id: user.id, phone: user.phone, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

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
    } catch (error) {
      next(error);
    }
  },

  /**
   * Вход пользователя
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, password } = req.body as IUserLoginRequest;

      const user = await User.findOne({ where: { phone } });
      
      if (!user || !user.password) {
        throw new AppError(401, 'Неверные учетные данные');
      }

      // Проверка блокировки
      if (user.isBlocked) {
        throw new AppError(403, 'Ваш аккаунт заблокирован. Обратитесь к администратору');
      }

      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        throw new AppError(401, 'Неверные учетные данные');
      }

      // JWT с ролью
      const token = jwt.sign(
        { id: user.id, phone: user.phone, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response: IAuthResponse = {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получение данных текущего пользователя
   */
  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError(401, 'Не авторизован');
      }

      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'phone', 'name', 'email', 'role', 'createdAt']
      });

      if (!user) {
        throw new AppError(404, 'Пользователь не найден');
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление данных текущего пользователя
   */
  async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError(401, 'Не авторизован');
      }

      const { name, phone, email } = req.body;

      const user = await User.findByPk(req.user.id);
      if (!user) {
        throw new AppError(404, 'Пользователь не найден');
      }

      // Обновляем поля
      if (typeof name !== 'undefined') user.name = name;
      if (typeof email !== 'undefined') user.email = email;
      
      // Проверяем уникальность телефона если он меняется
      if (typeof phone !== 'undefined' && phone !== user.phone) {
        const phoneExists = await User.findOne({ where: { phone } });
        if (phoneExists) {
          throw new AppError(400, 'Этот телефон уже используется');
        }
        user.phone = phone;
      }

      await user.save();

      res.json({
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получение публичной информации о пользователе
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: ['id', 'name', 'createdAt']
      });

      if (!user) {
        throw new AppError(404, 'Пользователь не найден');
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }
};