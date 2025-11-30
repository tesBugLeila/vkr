import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import sequelize from './config/database';
import usersRouter from './routes/users';
import postsRouter from './routes/posts';
import { startBackgroundTasks } from './utils/backgroundTasks';

// Загружаем переменные окружения из .env
dotenv.config();

// Создаем экземпляр приложения Express
const app = express();
const port = Number(process.env.PORT || 4000);

// --- Middleware ---
// Разрешаем CORS (кросс-доменные запросы)
app.use(cors());

// Разбираем JSON тела запросов
app.use(express.json());

// Разбираем URL-encoded данные (например, формы)
app.use(express.urlencoded({ extended: true }));

// --- Статика ---
// Публикуем директорию uploads для доступа к загруженным файлам
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// --- Роуты ---
// Роуты для работы с пользователями
app.use('/api/users', usersRouter);
// Роуты для работы с постами
app.use('/api/posts', postsRouter);

// --- Health check ---
// Проверка, что сервер жив и отвечает
app.get('/api/health', (req, res) => res.json({ ok: true }));

// --- Функция запуска сервера ---
async function start() {
  try {
    // Проверяем подключение к базе данных
    await sequelize.authenticate();
    console.log('Подключение к базе данных успешно');

    // Синхронизация моделей с базой (без force, чтобы не удалять данные)
    await sequelize.sync();

    // Запуск фоновых задач (например, удаление старых постов)
    startBackgroundTasks();

    // Запуск сервера на указанном порту
    app.listen(port, () => console.log(`Сервер запущен на http://localhost:${port}`));
  } catch (e) {
    console.error('Ошибка инициализации сервера:', e);
    process.exit(1); // Выход из процесса с ошибкой
  }
}

// Запуск сервера
start();
