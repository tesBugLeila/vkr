
import { Post } from '../models';
import { Op } from 'sequelize';
import { POST_LIFETIME_MS, CLEANUP_INTERVAL_MS } from './constants';
import { parseDate, formatDate } from './dateFormatter';

/**
 * Запуск фоновых задач (удаление старых постов)
 */
export function startBackgroundTasks() {
  console.log('🔄 Запуск фоновых задач (очистка старых постов)...');
  
  setInterval(async () => {
    try {
      const cutoffTime = Date.now() - POST_LIFETIME_MS;
      
      // Получаем все посты
      const allPosts = await Post.findAll({
        attributes: ['id', 'createdAt', 'title']
      });
      
      // Фильтруем старые посты
      const oldPosts = allPosts.filter(post => {
        const postTime = parseDate(post.createdAt);
        return postTime < cutoffTime;
      });
      
      // Удаляем
      if (oldPosts.length > 0) {
        const ids = oldPosts.map(p => p.id);
        await Post.destroy({ where: { id: { [Op.in]: ids } } });
        console.log(`🗑️  Удалено старых постов: ${oldPosts.length}`);
      }
    } catch (error) {
      console.error('❌ Ошибка фоновой задачи:', error);
    }
  }, CLEANUP_INTERVAL_MS);
}
