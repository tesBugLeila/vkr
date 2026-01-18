import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../config/database';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { formatDate } from '../utils/dateFormatter';
import { UserRole } from '../utils/constants';

async function createAdmin() {
  try {
    console.log('Создание администратора...\n');

    const { ADMIN_PHONE, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

    if (!ADMIN_PHONE || !ADMIN_PASSWORD || !ADMIN_NAME) {
      throw new Error('Не заданы переменные окружения администратора');
    }

    await sequelize.authenticate();

    const existing = await User.findOne({ where: { phone: ADMIN_PHONE } });

    if (existing) {
      if (existing.role === UserRole.ADMIN) {
        console.log(' Администратор уже существует');
      } else {
        existing.role = UserRole.ADMIN;
        await existing.save();
        console.log(`Пользователь ${ADMIN_PHONE} повышен до администратора`);
      }
      process.exit(0);
    }

    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await User.create({
      id: nanoid(),
      phone: ADMIN_PHONE,
      password: hashed,
      name: ADMIN_NAME,
      role: UserRole.ADMIN,
      isBlocked: false,
      createdAt: formatDate()
    });

    console.log(' Администратор создан');
    console.log(`Телефон: ${ADMIN_PHONE}`);
    console.log(`Пароль: ${ADMIN_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    console.error(' Ошибка:', error);
    process.exit(1);
  }
}

createAdmin();
