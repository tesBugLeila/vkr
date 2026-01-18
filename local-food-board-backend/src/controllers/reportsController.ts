
import { Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import { Report, User, Post } from '../models';
import { AuthRequest } from '../types/express';
import { AppError } from '../utils/AppError';
import { formatDate } from '../utils/dateFormatter';

export const reportsController = {
  /**
   * Создать жалобу на пользователя
   * POST /api/reports
   * Body: { reportedUserId, postId?, reason, description? }
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reportedUserId, postId, reason, description } = req.body;

      // Нельзя пожаловаться на самого себя
      if (reportedUserId === req.user?.id) {
        throw new AppError(400, 'Нельзя пожаловаться на самого себя');
      }

      // Проверяем существование пользователя
      const reportedUser = await User.findByPk(reportedUserId);
      if (!reportedUser) {
        throw new AppError(404, 'Пользователь не найден');
      }

      // Если указан пост - проверяем его существование
      if (postId) {
        const post = await Post.findByPk(postId);
        if (!post) {
          throw new AppError(404, 'Пост не найден');
        }
      }

      // Создаём жалобу
      const report = await Report.create({
        id: nanoid(),
        reporterId: req.user!.id,
        reportedUserId,
        postId: postId || null,
        reason,
        description: description || '',
        status: 'В обработке',
        createdAt: formatDate()
      });

      console.log(`Новая жалоба: ${req.user?.id} → ${reportedUserId} (${reason})`);

      res.status(201).json({
        success: true,
        message: 'Жалоба отправлена',
        report
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получить мои жалобы
   * GET /api/reports/my
   */
  async myReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reports = await Report.findAll({
        where: { reporterId: req.user!.id },
        include: [
          {
            model: User,
            as: 'reportedUser',
            attributes: ['id', 'phone', 'name']
          },
          {
            model: Post,
            as: 'post',
            attributes: ['id', 'title'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({ reports });
    } catch (error) {
      next(error);
    }
  }
};