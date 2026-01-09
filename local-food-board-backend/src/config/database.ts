import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Путь к файлу SQLite базы данных
 */
const storage = process.env.DATABASE_STORAGE || './database.sqlite';

console.log(`📊 Используется SQLite: ${storage}`);

/**
 * Создаём подключение к SQLite
 */
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // Настройки для SQLite
  define: {
    timestamps: false,      // Отключаем автоматические timestamp'ы
    underscored: false,     // Используем camelCase
    freezeTableName: true   // Не плюрализуем названия таблиц
  }
});

/**
 * Тестируем подключение
 */
export async function testConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite подключен успешно');
  } catch (error) {
    console.error('❌ Ошибка подключения к SQLite:', error);
    throw error;
  }
}

export default sequelize;