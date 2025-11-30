import { Post } from '../models';
import { Op } from 'sequelize';

/**
 * Функция запуска фоновых задач.
 * В данном случае задача удаляет посты, которые старше 24 часов.
 */
export function startBackgroundTasks() {
  // Запускаем интервал для фоновой задачи
  setInterval(async () => {
    try {
      // Вычисляем временную метку 24 часа назад
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;

      // Удаляем все посты, у которых createdAt меньше cutoff (т.е. старше 24 часов)
      await Post.destroy({ 
        where: { 
          createdAt: { [Op.lt]: cutoff } 
        } 
      });

      console.log('Фоновая задача: старые посты удалены');
    } catch (e) {
      // Логируем ошибку, если что-то пошло не так
      console.error('Ошибка фоновой задачи:', e);
    }
  }, 5 * 60 * 1000); // Интервал выполнения: каждые 5 минут
}
