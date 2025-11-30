import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { IUserRegisterRequest, IUserLoginRequest, IAuthResponse } from '../types/models';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'change_this';

export const usersController = {
  /**
   * Регистрация нового пользователя
   * @param req - Request, тело запроса содержит phone, password и необязательное name
   * @param res - Response
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { phone, password, name } = req.body as IUserRegisterRequest;

      // Проверяем обязательные поля
      if (!phone || !password) {
        res.status(400).json({ error: 'phone and password required' });
        return;
      }

      // Проверяем, зарегистрирован ли уже пользователь с таким телефоном
      const exists = await User.findOne({ where: { phone } });
      if (exists) {
        res.status(400).json({ error: 'phone already registered' });
        return;
      }

      // Хэшируем пароль
      const hashed = await bcrypt.hash(password, 10);

      // Создаем пользователя в базе
      const user = await User.create({
        id: nanoid(),        // уникальный идентификатор
        phone,
        password: hashed,    // сохраняем хэш пароля
        name: name || null,
        verified: true,      // помечаем как верифицированного
        createdAt: Date.now() // текущий timestamp
      });

      // Генерируем JWT для аутентификации
      const token = jwt.sign(
        { 
          id: user.id, 
          phone: user.phone 
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
          name: user.name 
        }, 
        token 
      };

      res.json(response);
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * Логин пользователя
   * @param req - Request, тело запроса содержит phone и password
   * @param res - Response
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { phone, password } = req.body as IUserLoginRequest;

      // Проверяем обязательные поля
      if (!phone || !password) {
        res.status(400).json({ error: 'phone and password required' });
        return;
      }

      // Ищем пользователя по телефону
      const user = await User.findOne({ where: { phone } });
      if (!user) {
        res.status(404).json({ error: 'user not found' });
        return;
      }

      // Проверяем, есть ли пароль
      if (!user.password) {
        res.status(401).json({ error: 'invalid credentials' });
        return;
      }

      // Сравниваем введенный пароль с хэшем
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: 'invalid credentials' });
        return;
      }

      // Генерируем JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          phone: user.phone 
        },
        JWT_SECRET,
        {
          expiresIn: '7d'
        }
      );

      // Формируем ответ
      const response: IAuthResponse = {
        token, 
        user: { 
          id: user.id, 
          phone: user.phone, 
          name: user.name 
        } 
      };

      res.json(response);
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
