import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import { Post, User } from '../models';
import { haversineDistance } from '../utils/geo';
import { Op } from 'sequelize';
import { IPostCreateRequest, IPostUpdateRequest } from '../types/models';
import { AuthRequest } from '../types/express';
import { AppError } from '../utils/AppError';
import { DEFAULT_SEARCH_RADIUS, DEFAULT_LIMIT, UserRole } from '../utils/constants';
import { formatDate, parseDate } from '../utils/dateFormatter';
import { notifyNeighbors } from '../utils/notificationService';

export const postsController = {

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const body = req.body as IPostCreateRequest;
      const files = (req.files as Express.Multer.File[] | undefined) || [];
      const photos = files.map(f => `/uploads/${f.filename}`);

      const post = await Post.create({
        id: nanoid(),
        title: body.title,
        description: body.description || '',
        price: body.price ? Number(body.price) : 0,
        contact: body.contact,
        category: body.category || 'Другое',
        district: body.district || '',
        photos,
        lat: body.lat ? Number(body.lat) : null,
        lon: body.lon ? Number(body.lon) : null,
        notifyNeighbors: Boolean(body.notifyNeighbors),
        userId: req.user?.id,
        createdAt: formatDate()
      });

      if (post.notifyNeighbors && post.lat && post.lon) {
        notifyNeighbors(post.id, post.title, post.lat, post.lon, req.user!.id)
          .catch(err => console.error('Ошибка отправки уведомлений:', err));
      }

      res.status(201).json({ post });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        category, district, q, lat, lon,
        radius = String(DEFAULT_SEARCH_RADIUS),
        limit = String(DEFAULT_LIMIT),
        page = '1',
        sort = 'desc', // ← новый параметр сортировки: 'desc' | 'asc'
        userId
      } = req.query;

      const where: any = {};
      if (category) where.category = category;
      if (district) where.district = district;
      if (userId) where.userId = userId;
      if (q) {
        const sanitized = String(q).replace(/[%_]/g, '\\$&');
        where[Op.or] = [
          { title: { [Op.like]: `%${sanitized}%` } },
          { description: { [Op.like]: `%${sanitized}%` } }
        ];
      }

      const limitNum = Math.min(Number(limit), 100);
      const pageNum = Number(page);
      const sortDesc = String(sort) !== 'asc';

      // ИСПРАВЛЕНИЕ: получаем ВСЕ посты без limit/offset,
      // сортируем глобально, потом нарезаем страницу вручную
      const allPosts = await Post.findAll({ where });

      // Глобальная сортировка по дате
      const sorted = allPosts.sort((a, b) => {
        try {
          const timeA = parseDate(a.createdAt);
          const timeB = parseDate(b.createdAt);
          return sortDesc ? timeB - timeA : timeA - timeB;
        } catch {
          return 0;
        }
      });

      // Геофильтрация — применяем до пагинации
      if (lat && lon && !userId) {
        const latNum = Number(lat);
        const lonNum = Number(lon);
        const r = Number(radius);

        const filtered = sorted
          .map((p) => {
            const plat = p.lat ?? 0;
            const plon = p.lon ?? 0;
            const dist = plat && plon
              ? haversineDistance(latNum, lonNum, plat, plon)
              : Infinity;
            return { post: p, distance: dist };
          })
          .filter((x) => x.distance <= r)
          .sort((a, b) => a.distance - b.distance);

        const total = filtered.length;
        const offset = (pageNum - 1) * limitNum;
        const page_items = filtered
          .slice(offset, offset + limitNum)
          .map((x) => ({ ...x.post.get(), distance: x.distance }));

        return res.json({
          posts: page_items,
          pagination: {
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
          }
        });
      }

      // Пагинация после глобальной сортировки
      const total = sorted.length;
      const offset = (pageNum - 1) * limitNum;
      const pagePosts = sorted.slice(offset, offset + limitNum);

      // Скрываем контакты
      const resPosts = pagePosts.map(p => {
        const obj = p.get() as any;
        obj.contact = obj.contact?.slice(0, -4) + 'XXXX';
        return obj;
      });

      res.json({
        posts: resPosts,
        pagination: {
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const post = await Post.findByPk(id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'phone', 'name'] }]
      });
      if (!post) throw new AppError(404, 'Пост не найден');
      post.contact = post.contact.slice(0, -4) + 'XXXX';
      res.json({ post });
    } catch (error) {
      next(error);
    }
  },

  async getContactById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const post = await Post.findByPk(id);
      if (!post) throw new AppError(404, 'Пост не найден');
      res.json(post.contact);
    } catch (error) {
      next(error);
    }
  },

  async getUserPosts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, 'Требуется авторизация');

      const posts = await Post.findAll({
        where: { userId },
        include: [{ model: User, as: 'user', attributes: ['id', 'phone', 'name'] }]
      });

      const sortedPosts = posts.sort((a, b) => {
        try { return parseDate(b.createdAt) - parseDate(a.createdAt); }
        catch { return 0; }
      });

      res.json({ posts: sortedPosts });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const body = req.body as IPostUpdateRequest;
      const post = await Post.findByPk(id);
      if (!post) throw new AppError(404, 'Пост не найден');

      if (post.userId && req.user?.id && post.userId !== req.user.id && req.user?.role !== UserRole.ADMIN) {
        throw new AppError(403, 'Можно редактировать только свои посты');
      }

      const updateData: any = {};
      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description || '';
      if (body.contact !== undefined) updateData.contact = body.contact;
      if (body.category !== undefined) updateData.category = body.category || '';
      if (body.district !== undefined) updateData.district = body.district || '';
      if (body.price !== undefined) {
        const p = Number(body.price);
        updateData.price = isNaN(p) ? 0 : p;
      }
      if (body.lat !== undefined) {
        const l = Number(body.lat);
        updateData.lat = isNaN(l) ? null : l;
      }
      if (body.lon !== undefined) {
        const l = Number(body.lon);
        updateData.lon = isNaN(l) ? null : l;
      }
      if (body.notifyNeighbors !== undefined) {
        updateData.notifyNeighbors = typeof body.notifyNeighbors === 'string'
          ? body.notifyNeighbors === 'true'
          : Boolean(body.notifyNeighbors);
      }

      const files = (req.files as Express.Multer.File[] | undefined) || [];
      if (files.length > 0) {
        updateData.photos = files.map(f => `/uploads/${f.filename}`);
      } else if (body.photos !== undefined) {
        updateData.photos = typeof body.photos === 'string'
          ? (() => { try { return JSON.parse(body.photos as string); } catch { return []; } })()
          : Array.isArray(body.photos) ? body.photos : [];
      }

      if (Object.keys(updateData).length > 0) {
        await post.update(updateData);
        await post.reload();
      }

      res.json({ post, message: 'Пост обновлен' });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const post = await Post.findByPk(id);
      if (!post) throw new AppError(404, 'Пост не найден');

   
    if (post.userId && req.user?.id && post.userId !== req.user.id && req.user?.role !== UserRole.ADMIN) {
      throw new AppError(403, 'Можно удалять только свои посты');
    }


      await post.destroy();
      res.json({ ok: true, message: 'Пост удален' });
    } catch (error) {
      next(error);
    }
  }
};