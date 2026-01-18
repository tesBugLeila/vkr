import { User, Notification } from '../models';
import { haversineDistance } from './geo';
import { formatDate } from './dateFormatter';
import { nanoid } from 'nanoid';
import { Op } from 'sequelize';
/**
 * Отправка уведомлений соседям о новом посте
 * 
 * @param postId - ID созданного поста
 * @param postTitle - Заголовок поста
 * @param postLat - Широта поста
 * @param postLon - Долгота поста
 * @param authorId - ID автора (не отправляем ему уведомление)
 * @param radius - Радиус уведомлений в метрах (по умолчанию 5км)
 */
export async function notifyNeighbors(
  postId: string,
  postTitle: string,
  postLat: number | null,
  postLon: number | null,
  authorId: string,
  radius: number = 500
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
    console.log(` Радиус: ${radius}м (${radius / 1000}км)`);

    // Получаем всех пользователей с геолокацией (кроме автора)
    const users = await User.findAll({
      where: {
       lastLat: { [Op.ne]: null },      // Есть широта
        lastLon: { [Op.ne]: null },      // Есть долгота
        isBlocked: false             // Не заблокирован
      }
    });

    console.log(` Найдено пользователей с геолокацией: ${users.length}`);

    if (users.length === 0) {
      console.log('  Нет пользователей с активной геолокацией');
      return 0;
    }

    // Фильтруем пользователей в радиусе
    const nearbyUsers = users
      .filter(user => user.id !== authorId) // Не отправляем автору
      .map(user => {
        const distance = haversineDistance(
          postLat,
          postLon,
          user.lastLat!,
          user.lastLon!
        );
        return { user, distance };
      })
      .filter(({ distance }) => distance <= radius) // В радиусе
      .sort((a, b) => a.distance - b.distance);     // Сортируем по близости

    console.log(` Пользователей в радиусе ${radius}м: ${nearbyUsers.length}`);

    if (nearbyUsers.length === 0) {
      console.log(' Нет соседей в радиусе уведомлений');
      return 0;
    }

    // Создаём уведомления для каждого соседа
    const notifications = await Promise.all(
      nearbyUsers.map(async ({ user, distance }) => {
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

          console.log(`   ${user.name} (${user.phone}) - ${Math.round(distance)}м`);
          return notification;
        } catch (error) {
          console.error(`   Ошибка для ${user.name}:`, error);
          return null;
        }
      })
    );

    const successCount = notifications.filter(n => n !== null).length;

    console.log(`\n Отправлено уведомлений: ${successCount}`);
    console.log(` === КОНЕЦ ОТПРАВКИ ===\n`);

    return successCount;
  } catch (error) {
    console.error(' Ошибка отправки уведомлений:', error);
    return 0;
  }
}


//ПЕРЕДЕЛАТЬ РАДИУС ЧТОБЫ УКАЗЫВАЛ ПОЛЬЗОВАТЕЛЬ

// * **Фронт** — управляет радиусом.
// * **Бэк** — получает его через тело запроса и использует в `notifyNeighbors`.
// * Если фронт ничего не передал — используется **значение по умолчанию**.
