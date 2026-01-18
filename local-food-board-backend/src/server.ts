import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import sequelize from './config/database';

import usersRouter from './routes/users';
import postsRouter from './routes/posts';
import adminRouter from './routes/admin';          
import reportsRouter from './routes/reports';      
import notificationsRouter from './routes/notifications';      


import { startBackgroundTasks } from './utils/backgroundTasks';
import { AppError } from './utils/AppError';
import { apiLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// Статика
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/admin', adminRouter);           
app.use('/api/reports', reportsRouter); 
app.use('/api/notifications', notificationsRouter);      


// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error('❌ Ошибка сервера:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключение к БД успешно');

    await sequelize.sync();
    console.log('✅ Модели синхронизированы');

    startBackgroundTasks();

    app.listen(port, () => {
      console.log(`🚀 Сервер запущен: http://localhost:${port}`);
      console.log(`📊 Health check: http://localhost:${port}/api/health`);
    });
  } catch (e) {
    console.error('❌ Ошибка запуска:', e);
    process.exit(1);
  }
}

start();