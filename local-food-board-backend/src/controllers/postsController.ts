import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { Post, User } from '../models';
import { haversineDistance } from '../utils/geo';
import { Op } from 'sequelize';
import { IPostCreateRequest, IPostUpdateRequest } from '../types/models';
import { AuthRequest } from '../types/express';

export const postsController = {
  /**
   * Создание нового поста
   * @param req - AuthRequest, содержит тело запроса и объект user из authMiddleware
   * @param res - Response
   */
  async create(req: AuthRequest, res: Response) {
    try {
      // Берем данные из тела запроса и приводим к типу IPostCreateRequest
      const body = req.body as IPostCreateRequest;

      // Получаем загруженные файлы через multer
      const files = (req.files as Express.Multer.File[] | undefined) || [];
      // Преобразуем их в массив путей для хранения в БД
      const photos = files.map(f => `/uploads/${f.filename}`);

      // Создаем пост в БД
      const post = await Post.create({
        id: nanoid(), // уникальный идентификатор
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
        userId: req.user?.id || null, // берем id пользователя из authMiddleware
       createdAt: new Date().toLocaleString('ru-RU') //в каком формет
      });

      // Возвращаем созданный пост
      res.json({ post });
    } catch (err) {
      console.error('Create post error', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * Получение списка постов с фильтрацией
   * @param req - Request, query-параметры для фильтрации
   * @param res - Response
   */
  async list(req: Request, res: Response) {
    try {
      // Деструктуризация параметров запроса
      const { category, district, q, lat, lon, radius = '5000', limit = '50' } = req.query;
      const where: any = {};

      // Добавляем фильтры для запроса
      if (category) where.category = category;
      if (district) where.district = district;
      if (q) where.title = { [Op.like]: `%${q}%` }; // поиск по подстроке

      // Получаем посты из БД с сортировкой по дате создания
      const posts = await Post.findAll({ where, order: [['createdAt', 'DESC']], limit: Number(limit) });

      // Если переданы координаты lat/lon - вычисляем расстояние и фильтруем по radius
      if (lat && lon) {
        const latNum = Number(lat);
        const lonNum = Number(lon);
        const r = Number(radius);

        const filtered = posts
          .map(p => {
            const plat = p.lat ?? 0;
            const plon = p.lon ?? 0;
            const dist = plat && plon ? haversineDistance(latNum, lonNum, plat, plon) : Infinity;
            return { post: p, distance: dist };
          })
          .filter(x => x.distance <= r) // фильтруем по радиусу
          .sort((a, b) => a.distance - b.distance) // сортируем по расстоянию
          .map(x => ({ ...x.post.get(), distance: x.distance })); // добавляем distance к объекту поста

        return res.json({ posts: filtered });
      }

      res.json({ posts });
    } catch (err) {
      console.error('List posts error', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  /**
   * Получение поста по ID
   * @param req - Request, содержит params.id
   * @param res - Response
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Находим пост по первичному ключу и подгружаем автора
      const post = await Post.findByPk(id, { include: [{ model: User, as: 'user', attributes: ['id', 'phone', 'name'] }] });
      if (!post) return res.status(404).json({ error: 'not found' });
      res.json({ post });
    } catch (err) {
      console.error('Get post error', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },


  /**
   * Обновление существующего поста
   * @param req - AuthRequest, содержит params.id, тело запроса и user из authMiddleware
   * @param res - Response
   */
  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const body = req.body as IPostUpdateRequest;

      // Находим пост для обновления
      const post = await Post.findByPk(id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Проверяем права доступа: только автор может редактировать
      if (post.userId && req.user?.id && post.userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden: you can only edit your own posts' });
      }

      // Подготавливаем данные для обновления
      const updateData: any = {};

      // Текстовые поля (обновляем только если переданы)
      if (body.title !== undefined) updateData.title = body.title;
      if (body.description !== undefined) updateData.description = body.description || '';
      if (body.contact !== undefined) updateData.contact = body.contact;
      if (body.category !== undefined) updateData.category = body.category || 'other';
      if (body.district !== undefined) updateData.district = body.district || '';
      
      // Числовые поля с проверкой
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
      
      // Boolean поле
      if (body.notifyNeighbors !== undefined) {
        updateData.notifyNeighbors = Boolean(body.notifyNeighbors);
      }

      // Обработка фотографий
      const files = (req.files as Express.Multer.File[] | undefined) || [];
      if (files.length > 0) {
        // Если есть новые фото, заменяем все старые
        const newPhotos = files.map(f => `/uploads/${f.filename}`);
        updateData.photos = newPhotos;
      } else if (body.photos !== undefined) {
        // Если клиент явно отправил новый массив фото (например, через JSON)
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

      // Обновляем пост (только если есть что обновлять)
      if (Object.keys(updateData).length > 0) {
        await post.update(updateData);
        
        // Обновляем объект поста для ответа
        await post.reload();
      }

      // Возвращаем обновленный пост
      res.json({ 
        post,
        message: 'Post updated successfully' 
      });
    } catch (err) {
      console.error('Update post error', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },



 



  /**
   * Удаление поста
   * @param req - AuthRequest, содержит params.id и user из authMiddleware
   * @param res - Response
   */
  async remove(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const post = await Post.findByPk(id);
      if (!post) return res.status(404).json({ error: 'not found' });

      // Разрешаем удаление только автору поста
      if (post.userId && req.user?.id && post.userId !== req.user.id) {
        return res.status(403).json({ error: 'forbidden' });
      }

      // Удаляем пост
      await post.destroy();
      res.json({ ok: true });
    } catch (err) {
      console.error('Remove post error', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
