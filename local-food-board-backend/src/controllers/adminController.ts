
import { Request, Response, NextFunction } from 'express';
import { User, Post, Report } from '../models';
import { AuthRequest } from '../types/express';
import { AppError } from '../utils/AppError';
import { Op } from 'sequelize';

export const adminController = {
  /**
   * Получить список всех пользователей
   * GET /api/admin/users
   */
  async listUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '50', search } = req.query;
      
      const pageNum = Number(page);
      const limitNum = Math.min(Number(limit), 100);
      const offset = (pageNum - 1) * limitNum;

      // Условия поиска
      const where: any = {};
      if (search) {
        where[Op.or] = [
          { phone: { [Op.like]: `%${search}%` } },
          { name: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows: users } = await User.findAndCountAll({
        where,
        attributes: ['id', 'phone', 'name', 'role', 'isBlocked',  'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: limitNum,
        offset
      });

      res.json({
        users,
        pagination: {
          total: count,
          page: pageNum,
          pages: Math.ceil(count / limitNum)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получить детальную информацию о пользователе
   * GET /api/admin/users/:id
   */
  async getUserDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: ['id', 'phone', 'name',  'role', 'isBlocked',  'createdAt']
      });

      if (!user) {
        throw new AppError(404, 'Пользователь не найден');
      }

      // Получаем статистику пользователя
      const postsCount = await Post.count({ where: { userId: id } });
      const reportsAgainst = await Report.count({ where: { reportedUserId: id } });
      const reportsMade = await Report.count({ where: { reporterId: id } });

      res.json({
        user,
        stats: {
          postsCount,
          reportsAgainst,
          reportsMade
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Блокировка/разблокировка пользователя
   * PATCH /api/admin/users/:id/block
   */
  async toggleBlockUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { blocked, reason } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        throw new AppError(404, 'Пользователь не найден');
      }

      // Нельзя заблокировать самого себя
      if (user.id === req.user?.id) {
        throw new AppError(400, 'Нельзя заблокировать самого себя');
      }

      user.isBlocked = Boolean(blocked);
      await user.save();

      console.log(`${blocked ? '🔒' : '🔓'} Пользователь ${user.phone} ${blocked ? 'заблокирован' : 'разблокирован'}`);
      if (reason) {
        console.log(`   Причина: ${reason}`);
      }

      res.json({
        success: true,
        message: blocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован',
        user: {
          id: user.id,
          phone: user.phone,
          isBlocked: user.isBlocked
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление пользователя (мягкое удаление)
   * DELETE /api/admin/users/:id
   */
  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        throw new AppError(404, 'Пользователь не найден');
      }

      // Нельзя удалить самого себя
      if (user.id === req.user?.id) {
        throw new AppError(400, 'Нельзя удалить самого себя');
      }

      // Удаляем пользователя и все его посты
      await Post.destroy({ where: { userId: id } });
      await user.destroy();

      console.log(`🗑️  Пользователь ${user.phone} удалён администратором`);

      res.json({
        success: true,
        message: 'Пользователь и его посты удалены'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получить все жалобы
   * GET /api/admin/reports
   */
  async listReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '50', status } = req.query;

      const pageNum = Number(page);
      const limitNum = Math.min(Number(limit), 100);
      const offset = (pageNum - 1) * limitNum;

      const where: any = {};
      if (status) where.status = status;

      const { count, rows: reports } = await Report.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'reporter',
            attributes: ['id', 'phone', 'name']
          },
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
        order: [['createdAt', 'DESC']],
        limit: limitNum,
        offset
      });

      res.json({
        reports,
        pagination: {
          total: count,
          page: pageNum,
          pages: Math.ceil(count / limitNum)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновить статус жалобы
   * PATCH /api/admin/reports/:id
   */
  async updateReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, adminComment } = req.body;

      const report = await Report.findByPk(id);
      if (!report) {
        throw new AppError(404, 'Жалоба не найдена');
      }

      if (status) report.status = status;
      if (adminComment) report.adminComment = adminComment;
      report.updatedAt = new Date().toISOString();

      await report.save();

      res.json({
        success: true,
        message: 'Жалоба обновлена',
        report
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Статистика по платформе
   * GET /api/admin/stats
   */
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const totalUsers = await User.count();
      const totalPosts = await Post.count();
      const totalReports = await Report.count();
      const pendingReports = await Report.count({ where: { status: 'pending' } });
      const blockedUsers = await User.count({ where: { isBlocked: true } });

      res.json({
        stats: {
          totalUsers,
          totalPosts,
          totalReports,
          pendingReports,
          blockedUsers
        }
      });
    } catch (error) {
      next(error);
    }
  }
};