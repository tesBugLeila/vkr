import { User, Notification } from '../models';
import { haversineDistance } from './geo';
import { formatDate } from './dateFormatter';
import { nanoid } from 'nanoid';
import { Op } from 'sequelize';


export async function notifyNeighbors(
  postId: string,
  postTitle: string,
  postLat: number | null,
  postLon: number | null,
  authorId: string
): Promise<number> {
 
  if (!postLat || !postLon) {
    return 0;
  }

  try {
   
    const users = await User.findAll({
      where: {
        id: { [Op.ne]: authorId },   
        lastLat: { [Op.ne]: null },  
        lastLon: { [Op.ne]: null },  
        isBlocked: false            
      },
      attributes: ['id', 'name', 'phone', 'lastLat', 'lastLon', 'notificationRadius']
    });

    if (users.length === 0) {
      return 0;
    }
    const eligibleUsers = users
      .map(user => {
        const distance = haversineDistance(
          postLat,
          postLon,
          user.lastLat!,
          user.lastLon!
        );
        
    const userRadius = user.notificationRadius || 5000;
    
    const isEnabled = userRadius > 0;
    const inRange = isEnabled && distance <= userRadius;
    
    return { user, distance, userRadius, isEnabled, inRange };
  })
  .filter(({ inRange }) => inRange) 
  .sort((a, b) => a.distance - b.distance);

 if (eligibleUsers.length === 0) {
  return 0;
}
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
          
          return notification;
        } catch (error) {
          return null;
        }
      })
    );

    const successCount = notifications.filter(n => n !== null).length;

    return successCount;
  } catch (error) {
    return 0;
  }
}