import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import { Post, User } from '../models';
import { haversineDistance } from '../utils/geo';
import { Op } from 'sequelize';
import { IPostCreateRequest, IPostUpdateRequest } from '../types/models';
import { AuthRequest } from '../types/express';
import { AppError } from '../utils/AppError';
import {DEFAULT_SEARCH_RADIUS, DEFAULT_LIMIT, UserRole} from '../utils/constants';
import { formatDate } from '../utils/dateFormatter';
import { notifyNeighbors } from '../utils/notificationService';
import { parseDate } from '../utils/dateFormatter'; // ← Импортируйте вашу функцию

export const postsController = {
  /**
   * Создание нового поста
   * @param req - AuthRequest, содержит тело запроса и объект user из authMiddleware
   * @param res - Response
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Берем данные из тела запроса и приводим к типу IPostCreateRequest
      const body = req.body as IPostCreateRequest;

      // Получаем загруженные файлы через multer
      const files = (req.files as Express.Multer.File[] | undefined) || [];
      // Преобразуем их в массив путей для хранения в БД
      const photos = files.map(f => `/uploads/${f.filename}`);

      // Создаем пост в БД
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
        createdAt: formatDate() // Теперь "14.12.2025 15:30" 
      });


//  ОТПРАВЛЯЕМ УВЕДОМЛЕНИЯ СОСЕДЯМ
    //  ОТПРАВЛЯЕМ УВЕДОМЛЕНИЯ СОСЕДЯМ
if (post.notifyNeighbors && post.lat && post.lon) {
  console.log('🔔 Отправка уведомлений соседям...');
  
  notifyNeighbors(
    post.id,
    post.title,
    post.lat,
    post.lon,
    req.user!.id
    // Радиус НЕ передаем - функция сама проверит радиус каждого пользователя
  ).catch(err => {
    console.error(' Ошибка отправки уведомлений:', err);
  });
}

      // Возвращаем созданный пост
   res.status(201).json({ post });
    } catch (error) {
      next(error);
    }
  },


  /**
   * Получение списка постов с фильтрацией
   * @param req - Request, query-параметры для фильтрации
   * @param res - Response
   */
 
 // postsController.ts - метод list
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
      page = '1',
      userId // Добавляем поддержку userId
    } = req.query;

    const where: any = {};

    if (category) where.category = category;
    if (district) where.district = district;
    if (userId) where.userId = userId; // Фильтрация по пользователю
    
    if (q) {
      const sanitized = String(q).replace(/[%_]/g, '\\$&');
      where[Op.or] = [
        { title: { [Op.like]: `%${sanitized}%` } },
        { description: { [Op.like]: `%${sanitized}%` } }
      ];
    }

    const limitNum = Math.min(Number(limit), 100);
    const pageNum = Number(page);
    const offset = (pageNum - 1) * limitNum;

    // 1. Получаем посты БЕЗ сортировки
    const { count, rows: unsortedPosts } = await Post.findAndCountAll({
      where,
      limit: limitNum,
      offset
    });

    // 2. Сортируем посты вручную с помощью parseDate()
    const sortedPosts = unsortedPosts.sort((a, b) => {
      try {
        const timeA = parseDate(a.createdAt);
        const timeB = parseDate(b.createdAt);
        return timeB - timeA; // Новые первыми (DESC)
      } catch (error) {
        console.error('Ошибка сортировки даты:', error);
        return 0;
      }
    });

    // Геофильтрация (только если указаны координаты)
    if (lat && lon && !userId) { // Не применяем геофильтрацию при поиске по userId
      const latNum = Number(lat);
      const lonNum = Number(lon);
      const r = Number(radius);

      const filtered = sortedPosts
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

    // 3. Возвращаем отсортированные посты
    res.json({
      posts: sortedPosts,
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
   * Получение поста по ID
   * @param req - Request, содержит params.id
   * @param res - Response
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
   * Получить все посты пользователя (без пагинации, с фильтром по userId)
   */

async getUserPosts(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new AppError(401, 'Требуется авторизация');
    }

    // Получаем все посты пользователя
    const posts = await Post.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'phone', 'name']
        }
      ]
    });

    // Сортируем посты вручную с помощью parseDate()
    const sortedPosts = posts.sort((a, b) => {
      try {
        const timeA = parseDate(a.createdAt);
        const timeB = parseDate(b.createdAt);
        return timeB - timeA; // Новые первыми (DESC)
      } catch (error) {
        console.error('Ошибка сортировки даты:', error);
        return 0;
      }
    });

    res.json({ posts: sortedPosts });
  } catch (error) {
    next(error);
  }
},


/**
 * Обновление существующего поста.
 *
 * @param req  - AuthRequest, содержит params.id, тело запроса и user из authMiddleware
 * @param res  - HTTP Response
 * @param next - Функция передачи ошибки в middleware
 */
async update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // 1. Извлекаем идентификатор поста из параметров URL
    const { id } = req.params;

    // 2. Извлекаем тело запроса с данными для обновления поста
    const body = req.body as IPostUpdateRequest;

    // 3. Загружаем пост из базы данных по его ID
    const post = await Post.findByPk(id);

    // 4. Если пост не найден — возвращаем ошибку 404
    if (!post) {
      throw new AppError(404, 'Пост не найден');
    }

    // 5. Проверяем право на редактирование поста:
    // редактировать может только автор поста
    if (post.userId && req.user?.id && post.userId !== req.user.id && req.user?.role !== UserRole.ADMIN) {
      throw new AppError(403, 'Можно редактировать только свои посты');
    }

    // 6. Создаём объект для хранения обновляемых данных
    const updateData: any = {};

    // 7. Обновляем текстовые поля, если они переданы в запросе
    if (body.title !== undefined) {
      updateData.title = body.title;
    }

    if (body.description !== undefined) {
      updateData.description = body.description || '';
    }

    if (body.contact !== undefined) {
      updateData.contact = body.contact;
    }

    if (body.category !== undefined) {
      updateData.category = body.category || '';
    }

    if (body.district !== undefined) {
      updateData.district = body.district || '';
    }

    // 8. Обрабатываем цену: приводим к числу, при ошибке используем 0
    if (body.price !== undefined) {
      const priceNum = Number(body.price);
      updateData.price = isNaN(priceNum) ? 0 : priceNum;
    }

    // 9. Обрабатываем координаты широты
    if (body.lat !== undefined) {
      const latNum = Number(body.lat);
      updateData.lat = isNaN(latNum) ? null : latNum;
    }

    // 10. Обрабатываем координаты долготы
    if (body.lon !== undefined) {
      const lonNum = Number(body.lon);
      updateData.lon = isNaN(lonNum) ? null : lonNum;
    }

      // 11. Обрабатываем флаг уведомления соседей
    if (body.notifyNeighbors !== undefined) {
      const value = body.notifyNeighbors;
      
      if (typeof value === 'boolean') {
        updateData.notifyNeighbors = value;
      } else if (typeof value === 'string') {
        // FormData передает как строку "true"/"false"
        updateData.notifyNeighbors = value === 'true';
      } else {
        updateData.notifyNeighbors = Boolean(value);
      }
      
      console.log('✓ notifyNeighbors обновлен:', updateData.notifyNeighbors);
    }

    // 12. Обрабатываем загруженные файлы (фотографии)
    const files = (req.files as Express.Multer.File[] | undefined) || [];

    // Если загружены новые файлы — формируем новый список фотографий
    if (files.length > 0) {
      const newPhotos = files.map((file) => `/uploads/${file.filename}`);
      updateData.photos = newPhotos;
    }
    // Если файлы не загружены, но photos переданы в теле запроса —
    // обновляем список фотографий из body
    else if (body.photos !== undefined) {
      if (typeof body.photos === 'string') {
        try {
          // Пытаемся распарсить строку JSON
          updateData.photos = JSON.parse(body.photos);
        } catch {
          // При ошибке парсинга устанавливаем пустой массив
          updateData.photos = [];
        }
      } else if (Array.isArray(body.photos)) {
        updateData.photos = body.photos;
      }
    }

    // 13. Если есть данные для обновления —
    // выполняем обновление поста и перечитываем его из базы
    if (Object.keys(updateData).length > 0) {
      await post.update(updateData);
      await post.reload();
    }

    // 14. Отправляем клиенту обновлённый пост и сообщение об успехе
    res.json({
      post,
      message: 'Пост обновлен'
    });
  } catch (error) {
    // 15. Передаём ошибку в централизованный обработчик
    next(error);
  }
}
,

  /**
   * Удаление поста
   * @param req - AuthRequest, содержит params.id и user из authMiddleware
   * @param res - Response
   */
  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const post = await Post.findByPk(id);

      if (!post) {
        throw new AppError(404, 'Пост не найден');
      }

      if (post.userId && req.user?.id && post.userId !== req.user.id) {
        throw new AppError(403, 'Можно удалять только свои посты');
      }

      await post.destroy();
      res.json({ ok: true, message: 'Пост удален' });
    } catch (error) {
      next(error);
    }
  }
}
