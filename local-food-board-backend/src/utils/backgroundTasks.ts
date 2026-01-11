// utils/backgroundTasks.ts - ВЕРСИЯ С ОТЛАДКОЙ

import { Post } from '../models';
import { Op } from 'sequelize';
import { POST_LIFETIME_MS, CLEANUP_INTERVAL_MS } from './constants';
import { formatDate, parseDate } from './dateFormatter';

export function startBackgroundTasks() {
  console.log(' Запуск фоновых задач (очистка постов старше 24ч)...');
  console.log(` Интервал проверки: ${CLEANUP_INTERVAL_MS / 1000 / 60} минут`);
  console.log(` Время жизни поста: ${POST_LIFETIME_MS / 1000 / 60 / 60} часов\n`);
  
  //  НЕМЕДЛЕННАЯ ПРОВЕРКА при запуске
  checkAndCleanPosts();
  
  // Потом каждые 5 минут
  setInterval(checkAndCleanPosts, CLEANUP_INTERVAL_MS);
}

async function checkAndCleanPosts() {
  try {
    console.log('\n=== НАЧАЛО ПРОВЕРКИ ===');
    console.log(` Текущее время: ${formatDate()}`);
    
    // Вычисляем дату отсечки (24 часа назад)
    const cutoffTime = Date.now() - POST_LIFETIME_MS;
    const cutoffDate = formatDate(cutoffTime);
    
    console.log(` Удаляем посты старше: ${cutoffDate}`);
    
    
    // Получаем ВСЕ посты
    const allPosts = await Post.findAll({
      attributes: ['id', 'createdAt', 'title']
    });
    
    console.log(` Всего постов в БД: ${allPosts.length}`);
    
    if (allPosts.length === 0) {
      console.log('  База данных пуста');
      console.log(' === КОНЕЦ ПРОВЕРКИ ===\n');
      return;
    }
    
    // Отладка: показываем все посты с их временем
    console.log('\n Посты в БД:');
    allPosts.forEach((post, index) => {
      try {
        const postTime = parseDate(post.createdAt);
        const age = Date.now() - postTime;
        const ageHours = (age / 1000 / 60 / 60).toFixed(1);
        const isOld = postTime < cutoffTime;
        
        console.log(`  ${index + 1}. "${post.title.substring(0, 30)}..."`);
        console.log(`     Создан: ${post.createdAt}`);
        console.log(`     Timestamp: ${postTime}`);
        console.log(`     Возраст: ${ageHours} часов`);
        console.log(`     Старый? ${isOld ? ' ДА (удалим)' : ' НЕТ'}`);
      } catch (error) {
        console.log(`  ${index + 1}. "${post.title}" -  ОШИБКА ПАРСИНГА ДАТЫ`);
      }
    });
    
    // Фильтруем посты старше 24 часов
    const oldPosts = allPosts.filter(post => {
      try {
        const postTime = parseDate(post.createdAt);
        return postTime < cutoffTime;
      } catch (error) {
        console.error(` Ошибка парсинга даты поста ${post.id}:`, error);
        return false;
      }
    });
    
    console.log(`\n Найдено старых постов: ${oldPosts.length}`);
    
    // Удаляем старые посты
    if (oldPosts.length > 0) {
      console.log('\n  Удаляем посты:');
      
      oldPosts.forEach(post => {
        console.log(`   - "${post.title}" (${post.createdAt})`);
      });
      
      const idsToDelete = oldPosts.map(p => p.id);
      
      const deletedCount = await Post.destroy({
        where: {
          id: { [Op.in]: idsToDelete }
        }
      });
      
      console.log(`\n Успешно удалено: ${deletedCount} постов`);
    } else {
      console.log(' Старых постов нет (все свежие)');
    }
    
    console.log(' === КОНЕЦ ПРОВЕРКИ ===\n');
  } catch (error) {
    console.error('\n КРИТИЧЕСКАЯ ОШИБКА фоновой задачи:');
    console.error(error);
    console.log(' === КОНЕЦ ПРОВЕРКИ (С ОШИБКОЙ) ===\n');
  }
}