import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import { Post, User } from '../models';
import { haversineDistance } from '../utils/geo';
import { Op } from 'sequelize';
import { IPostCreateRequest, IPostUpdateRequest } from '../types/models';
import { AuthRequest } from '../types/express';
import { AppError } from '../utils/AppError';
import { DEFAULT_SEARCH_RADIUS, DEFAULT_LIMIT } from '../utils/constants';
import { formatDate } from '../utils/dateFormatter';
import { notifyNeighbors } from '../utils/notificationService';

export const postsController = {
  /**
   * Создание нового поста
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const body = req.body as IPostCreateRequest;
      const files = (req.files as Express.Multer.File[] | undefined) || [];
      const photos = files.map((f) => `/uploads/${f.filename}`);

      const post = await Post.create({
        id: nanoid(),
        title: body.title,
        description: body.description || '',
        price: body.price ? Number(body.price) : 0,
        contact: body.contact,
        category: body.category || 'other',
        district: body.district || '',
        photos,
        lat: body.lat ? Number(body.lat) : null,
        lon: body.lon ? Number(body.lon) : null,
        notifyNeighbors: Boolean(body.notifyNeighbors),
        userId: req.user!.id,
        createdAt: formatDate()
      });

      // Отправляем уведомления соседям если нужно
      if (post.notifyNeighbors && post.lat && post.lon) {
        await notifyNeighbors(post.title, post.lat, post.lon);
      }

      res.status(201).json({ post });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получение списка постов с фильтрацией
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        category,
        district,
        q,
        lat,
        lon,
        radius = String(DEFAULT_SEARCH_RADIUS),
        limit = String(DEFAULT_LIMIT),
        page = '1'
      } = req.query;

      const where: any = {};

      if (category) where.category = category;
      if (district) where.district = district;
      
      // Защита от SQL injection
      if (q) {
        const sanitized = String(q).replace(/[%_]/g, '\\');
        where.title = { [Op.like]: `%${sanitized}%` }; // ✅ like для SQLite (без i)
      }

      const limitNum = Math.min(Number(limit), 100);
      const pageNum = Number(page);
      const offset = (pageNum - 1) * limitNum;

      const { count, rows: posts } = await Post.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: limitNum,
        offset
      });

      // Геофильтрация
      if (lat && lon) {
        const latNum = Number(lat);
        const lonNum = Number(lon);
        const r = Number(radius);

        const filtered = posts
          .map((p) => {
            const plat = p.lat ?? 0;
            const plon = p.lon ?? 0;
            const dist =
              plat && plon
                ? haversineDistance(latNum, lonNum, plat, plon)
                : Infinity;
            return { post: p, distance: dist };
          })
          .filter((x) => x.distance <= r)
          .sort((a, b) => a.distance - b.distance)
          .map((x) => ({ ...x.post.get(), distance: x.distance }));

        return res.json({
          posts: filtered,
          pagination: {
            total: filtered.length,
            page: pageNum,
            pages: Math.ceil(filtered.length / limitNum)
          }
        });
      }

      res.json({
        posts,
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
   * Получение одного поста по ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const post = await Post.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'phone', 'name']
          }
        ]
      });

      if (!post) {
        throw new AppError(404, 'Пост не найден');
      }

      res.json({ post });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление поста
   */
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const body = req.body as IPostUpdateRequest;

      const post = await Post.findByPk(id);
      if (!post) {
        throw new AppError(404, 'Пост не найден');
      }

      if (post.userId !== req.user!.id) {
        throw new AppError(403, 'Можно редактировать только свои посты');
      }

      const updateData: any = {};

      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description || '';
      if (body.contact !== undefined) updateData.contact = body.contact;
      if (body.category !== undefined) updateData.category = body.category || 'other';
      if (body.district !== undefined) updateData.district = body.district || '';

      if (body.price !== undefined) {
        const priceNum = Number(body.price);
        updateData.price = isNaN(priceNum) ? 0 : priceNum;
      }

      if (body.lat !== undefined) {
        const latNum = Number(body.lat);
        updateData.lat = isNaN(latNum) ? null : latNum;
      }

      if (body.lon !== undefined) {
        const lonNum = Number(body.lon);
        updateData.lon = isNaN(lonNum) ? null : lonNum;
      }

      if (body.notifyNeighbors !== undefined) {
        updateData.notifyNeighbors = Boolean(body.notifyNeighbors);
      }

      // Обработка фото
      const files = (req.files as Express.Multer.File[] | undefined) || [];
      if (files.length > 0) {
        updateData.photos = files.map((f) => `/uploads/${f.filename}`);
      } else if (body.photos !== undefined) {
        if (typeof body.photos === 'string') {
          try {
            updateData.photos = JSON.parse(body.photos);
          } catch {
            updateData.photos = [];
          }
        } else if (Array.isArray(body.photos)) {
          updateData.photos = body.photos;
        }
      }

      if (Object.keys(updateData).length > 0) {
        await post.update(updateData);
        await post.reload();
      }

      res.json({
        post,
        message: 'Пост обновлен'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление поста
   */
  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const post = await Post.findByPk(id);

      if (!post) {
        throw new AppError(404, 'Пост не найден');
      }

      if (post.userId !== req.user!.id) {
        throw new AppError(403, 'Можно удалять только свои посты');
      }

      await post.destroy();
      res.json({ ok: true, message: 'Пост удален' });
    } catch (error) {
      next(error);
    }
  }
};