
import { Request, Response, NextFunction } from 'express';
import { Notification, Post } from '../models';
import { AuthRequest } from '../types/express';
import { AppError } from '../utils/AppError';
import { formatDate } from '../utils/dateFormatter';

export const notificationsController = {
  /**
   * Получить мои уведомления
   * GET /api/notifications
   */
  async getMyNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { unreadOnly } = req.query;

      const where: any = { userId: req.user!.id };
      
      // Фильтр только непрочитанных
      if (unreadOnly === 'true') {
        where.isRead = false;
      }

      const notifications = await Notification.findAll({
        where,
        include: [
          {
            model: Post,
            as: 'post',
            attributes: ['id', 'title', 'category', 'price', 'photos'],
            required: false // Если пост удалён, уведомление остаётся
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 50
      });

      const unreadCount = await Notification.count({
        where: {
          userId: req.user!.id,
          isRead: false
        }
      });

      res.json({
        notifications,
        unreadCount
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Отметить уведомление как прочитанное
   * PATCH /api/notifications/:id/read
   */
  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const notification = await Notification.findByPk(id);
      
      if (!notification) {
        throw new AppError(404, 'Уведомление не найдено');
      }

      // Проверка что уведомление принадлежит пользователю
      if (notification.userId !== req.user!.id) {
        throw new AppError(403, 'Это не ваше уведомление');
      }

      notification.isRead = true;
      await notification.save();

      res.json({
        success: true,
        notification
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Отметить все уведомления как прочитанные
   * POST /api/notifications/read-all
   */
  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [updatedCount] = await Notification.update(
        { isRead: true },
        {
          where: {
            userId: req.user!.id,
            isRead: false
          }
        }
      );

      res.json({
        success: true,
        updatedCount,
        message: `Отмечено прочитанными: ${updatedCount} уведомлений`
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удалить уведомление
   * DELETE /api/notifications/:id
   */
  async deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const notification = await Notification.findByPk(id);
      
      if (!notification) {
        throw new AppError(404, 'Уведомление не найдено');
      }

      if (notification.userId !== req.user!.id) {
        throw new AppError(403, 'Это не ваше уведомление');
      }

      await notification.destroy();

      res.json({
        success: true,
        message: 'Уведомление удалено'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновить геолокацию пользователя
   * POST /api/notifications/update-location
   */
  async updateLocation(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { lat, lon } = req.body;

      if (!lat || !lon) {
        throw new AppError(400, 'Требуются lat и lon');
      }

      const latNum = Number(lat);
      const lonNum = Number(lon);

      if (isNaN(latNum) || isNaN(lonNum)) {
        throw new AppError(400, 'Некорректные координаты');
      }

      if (latNum < -90 || latNum > 90) {
        throw new AppError(400, 'Широта должна быть от -90 до 90');
      }

      if (lonNum < -180 || lonNum > 180) {
        throw new AppError(400, 'Долгота должна быть от -180 до 180');
      }

      const { User } = await import('../models');
      const user = await User.findByPk(req.user!.id);

      if (!user) {
        throw new AppError(404, 'Пользователь не найден');
      }

      user.lastLat = latNum;
      user.lastLon = lonNum;
      user.lastLocationUpdate = formatDate();
      await user.save();

      console.log(` Геолокация обновлена: ${user.name} (${latNum}, ${lonNum})`);

      res.json({
        success: true,
        message: 'Геолокация обновлена',
        location: {
          lat: user.lastLat,
          lon: user.lastLon,
          updatedAt: user.lastLocationUpdate
        }
      });
    } catch (error) {
      next(error);
    }
  },

async clearLocation(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { User } = await import('../models');
    const user = await User.findByPk(req.user!.id);

    if (!user) {
      throw new AppError(404, 'Пользователь не найден');
    }

    user.lastLat = null;
    user.lastLon = null;
    user.lastLocationUpdate = null;
    await user.save();

    console.log(`📍 Геолокация отключена: ${user.name || user.phone}`);

    res.json({
      success: true,
      message: 'Геолокация отключена'
    });
  } catch (error) {
    next(error);
  }
}











};
