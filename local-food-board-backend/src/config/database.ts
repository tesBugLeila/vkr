import { Sequelize } from 'sequelize';

import * as dotenv from 'dotenv';

dotenv.config();

// Определяем путь к файлу базы данных SQLite
// Если в .env файле указана переменная DATABASE_STORAGE, используем её
// Иначе используем путь по умолчанию './database.sqlite' в текущей директории
const storage = process.env.DATABASE_STORAGE || './database.sqlite';

// Создаем новый экземпляр Sequelize для подключения к базе данных SQLite
// Этот объект будет использоваться во всем приложении для всех операций с БД
const sequelize = new Sequelize({
  dialect: 'sqlite',      // Указываем, что используем SQLite как СУБД
  storage,                // Путь к файлу базы данных (определен выше)
  logging: true          // Отключаем логирование SQL запросов в консоль
                          // В продакшене это улучшает производительность
});

// Экспортируем созданный экземпляр sequelize
// Теперь его можно импортировать в других файлах приложения для работы с базой данных
export default sequelize;