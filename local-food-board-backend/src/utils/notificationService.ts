import { User, Notification } from '../models';
import { haversineDistance } from './geo';
import { formatDate } from './dateFormatter';
import { nanoid } from 'nanoid';
import { Op } from 'sequelize';

/**
 * Отправка уведомлений соседям о новом посте
 * 
 * Каждый пользователь получает уведомление ТОЛЬКО если:
 * 1. Он не автор поста
 * 2. Расстояние до поста <= ЕГО ЛИЧНОГО радиуса уведомлений
 * 
 * @param postId - ID созданного поста
 * @param postTitle - Заголовок поста
 * @param postLat - Широта поста
 * @param postLon - Долгота поста
 * @param authorId - ID автора (не отправляем ему уведомление)
 */
export async function notifyNeighbors(
  postId: string,
  postTitle: string,
  postLat: number | null,
  postLon: number | null,
  authorId: string
): Promise<number> {
  // Если координаты не указаны - не отправляем уведомления
  if (!postLat || !postLon) {
    console.log('  Координаты поста не указаны, уведомления не отправлены');
    return 0;
  }

  try {
    console.log(`\n === ОТПРАВКА УВЕДОМЛЕНИЙ СОСЕДЯМ ===`);
    console.log(` Пост: "${postTitle}"`);
    console.log(` Координаты: ${postLat}, ${postLon}`);

    // Получаем всех пользователей с геолокацией (кроме автора)
    const users = await User.findAll({
      where: {
        id: { [Op.ne]: authorId },   // Не автор
        lastLat: { [Op.ne]: null },  // Есть широта
        lastLon: { [Op.ne]: null },  // Есть долгота
        isBlocked: false             // Не заблокирован
      },
      attributes: ['id', 'name', 'phone', 'lastLat', 'lastLon', 'notificationRadius']
    });

    console.log(` Найдено пользователей с геолокацией: ${users.length}`);

    if (users.length === 0) {
      console.log('  Нет пользователей с активной геолокацией');
      return 0;
    }

    // Фильтруем пользователей по ИХ ЛИЧНОМУ радиусу
    const eligibleUsers = users
      .map(user => {
        const distance = haversineDistance(
          postLat,
          postLon,
          user.lastLat!,
          user.lastLon!
        );
        
    // Радиус пользователя (по умолчанию 5000, если не задан)
    const userRadius = user.notificationRadius || 5000;
    
    //  Проверяем что радиус > 0
    const isEnabled = userRadius > 0;
    const inRange = isEnabled && distance <= userRadius;
    
    // Используем уже созданную переменную inRange
    return { user, distance, userRadius, isEnabled, inRange };
  })
  .filter(({ inRange }) => inRange) // Оставляем только тех, кто включил уведомления и в радиусе
  .sort((a, b) => a.distance - b.distance);

   console.log(` Пользователей, которые получат уведомление: ${eligibleUsers.length}`);
console.log(` (учитываются только те, кто включил уведомления)\n`);


 if (eligibleUsers.length === 0) {
  console.log(' ⚠️ Нет пользователей в радиусе уведомлений');
  console.log('   Возможные причины:');
  console.log('   - Все пользователи отключили уведомления (radius = 0)');
  console.log('   - Все пользователи находятся дальше своего установленного радиуса');
  return 0;
}
    // Создаём уведомления
    const notifications = await Promise.all(
      eligibleUsers.map(async ({ user, distance, userRadius }) => {
        try {
          const notification = await Notification.create({
            id: nanoid(),
            userId: user.id,
            postId,
            postTitle,
            distance: Math.round(distance),
            isRead: false,
            createdAt: formatDate()
          });

          console.log(
            `   ✓ ${user.name || user.phone} - ${Math.round(distance)}м ` +
            `(радиус: ${userRadius}м / ${(userRadius/1000).toFixed(1)}км)`
          );
          
          return notification;
        } catch (error) {
          console.error(`   ✗ Ошибка для ${user.name}:`, error);
          return null;
        }
      })
    );

    const successCount = notifications.filter(n => n !== null).length;

    console.log(`\n ✓ Отправлено уведомлений: ${successCount}`);
    console.log(` === КОНЕЦ ОТПРАВКИ ===\n`);

    return successCount;
  } catch (error) {
    console.error(' ✗ Ошибка отправки уведомлений:', error);
    return 0;
  }
}