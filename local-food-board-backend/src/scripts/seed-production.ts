import { User, Post, Report } from '../models';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { formatDate } from '../utils/dateFormatter';
import sequelize from '../config/database';
import { UserRole } from "../utils/constants";

const PHOTO_URLS = {
  kolbasa: [
    'https://api.svoe-rodnoe.ru/api/v1/img/b2c/1920/1920/resize/catalog/product/i/m/image_14_9_.png',
    'https://api.svoe-rodnoe.ru/api/v1/img/b2c/1920/1920/resize/catalog/product/f/r/frame_5330582.png'
  ],
  grudinka: [
    'https://api.svoe-rodnoe.ru/api/v1/img/b2c/1920/1920/resize/catalog/product/s/n/snimok-ekrana-2024-07-08-150408-jpeg.jpeg',
    'https://api.svoe-rodnoe.ru/api/v1/img/b2c/1920/1920/resize/catalog/product/s/n/snimok-ekrana-2024-07-08-144301-jpeg.jpeg',
    'https://api.svoe-rodnoe.ru/api/v1/img/b2c/1920/1920/resize/catalog/product/m/o/mountain-fox-notebook-jpeg.jpeg'
  ],
  salo: [
    'https://api.svoe-rodnoe.ru/api/v1/img/b2c/1920/1920/resize/catalog/product/s/a/salo-dom-jpeg.jpeg'
  ],
  moloko: [
    'https://api.svoe-rodnoe.ru/api/v1/img/b2c/1920/1920/resize/catalog/product/0/4/04-jpeg.jpeg'
  ],
  tvorog: [
    'https://api.svoe-rodnoe.ru/api/v1/img/b2c/1920/1920/resize/catalog/product/2/1/21_1_6.jpeg'
  ],
  smetana: [
    'https://api.svoe-rodnoe.ru/api/v1/img/b2c/1920/1920/resize/catalog/product/2/2/22-jpeg_172.jpeg'
  ]
};

async function seedProductionDataWithPhotos() {
  try {
    console.log(' Начинаем заполнение базы данных...\n');

    await sequelize.authenticate();
    console.log('Подключение к базе данных установлено');
    await sequelize.sync();
    console.log(' Модели синхронизированы\n');

    // ─── ПОЛЬЗОВАТЕЛИ ───────────────────────────────────────────

    console.log(' Создание пользователей...');
    const existingUsers = await User.count();

    if (existingUsers === 0) {
      const vasiliy = await User.create({
        id: nanoid(), phone: '+79001234567',
        password: await bcrypt.hash('123456', 10),
        name: 'Василий', role: UserRole.DEBUG, isBlocked: false,
        notificationRadius: 5000, lastLat: 53.227085, lastLon: 50.621273,
        lastLocationUpdate: formatDate(), createdAt: formatDate()
      });
      console.log(` ${vasiliy.name}`);

      const galina = await User.create({
        id: nanoid(), phone: '+79009876543',
        password: await bcrypt.hash('123456', 10),
        name: 'Галина', role: UserRole.DEBUG, isBlocked: false,
        notificationRadius: 10000, lastLat: 53.232085, lastLon: 50.625273,
        lastLocationUpdate: formatDate(), createdAt: formatDate()
      });
      console.log(` ${galina.name}`);

      const admin = await User.create({
        id: nanoid(), phone: '+79005555555',
        password: await bcrypt.hash('555555', 10),
        name: 'Администратор', role: UserRole.ADMIN, isBlocked: false,
        notificationRadius: 50000, lastLat: 53.220085, lastLon: 50.615273,
        lastLocationUpdate: formatDate(), createdAt: formatDate()
      });
      console.log(` ${admin.name}`);

      // Заблокированный пользователь для TC-AUTH-07
      const blocked = await User.create({
        id: nanoid(), phone: '+79009000000',
        password: await bcrypt.hash('123456', 10),
        name: 'Заблокированный', role: UserRole.DEBUG, isBlocked: true,
        notificationRadius: 0, lastLat: null, lastLon: null,
        lastLocationUpdate: formatDate(), createdAt: formatDate()
      });
      console.log(` ${blocked.name} (isBlocked: true)\n`);
    } else {
      console.log(`  В базе уже есть ${existingUsers} пользователей\n`);
    }

    const users = await User.findAll();
    console.log(' Найденные пользователи:');
    users.forEach(u => {
      console.log(`   - ${u.name} (${u.phone}) role:${u.role} blocked:${u.isBlocked}`);
    });
    console.log('');

    const vasiliyUser = users.find(u => u.phone === '+79001234567')!;
    const galinaUser  = users.find(u => u.phone === '+79009876543')!;
    const adminUser   = users.find(u => u.phone === '+79005555555')!;

    if (!vasiliyUser) { console.error('❌ Василий не найден!'); process.exit(1); }
    if (!galinaUser)  { console.error('❌ Галина не найдена!'); process.exit(1); }
    if (!adminUser)   { console.error('❌ Администратор не найден!'); process.exit(1); }

    // ─── ПОСТЫ ──────────────────────────────────────────────────

    console.log(' Создание объявлений...');
    const existingPosts = await Post.count();

    if (existingPosts > 0) {
      console.log(`  В базе уже есть ${existingPosts} объявлений, пропускаем\n`);
    } else {
      const allPosts = [
        {
          userId: vasiliyUser.id, title: 'Домашняя колбаса',
          description: 'Продаю домашнюю колбасу из свинины. Без добавок и консервантов.',
          price: 450, category: 'Мясо', district: 'Промышленный',
          contact: vasiliyUser.phone, lat: 53.227085, lon: 50.621273,
          photos: PHOTO_URLS.kolbasa, notifyNeighbors: true
        },
        {
          userId: vasiliyUser.id, title: 'Копченая грудинка',
          description: 'Свежая копченая грудинка собственного производства. Коптил на яблоне.',
          price: 550, category: 'Мясо', district: 'Промышленный',
          contact: vasiliyUser.phone, lat: 53.227085, lon: 50.621273,
          photos: PHOTO_URLS.grudinka, notifyNeighbors: true
        },
        {
          userId: vasiliyUser.id, title: 'Домашнее сало',
          description: 'Отличное сало с прослойкой. Хорошо просолено с чесноком.',
          price: 350, category: 'Мясо', district: 'Промышленный',
          contact: vasiliyUser.phone, lat: 53.227085, lon: 50.621273,
          photos: PHOTO_URLS.salo, notifyNeighbors: false
        },
        {
          userId: galinaUser.id, title: 'Свежее коровье молоко',
          description: 'Парное молоко от домашней коровы. Надой сегодня утром.',
          price: 80, category: 'Молочные продукты', district: 'Промышленный',
          contact: galinaUser.phone, lat: 53.232085, lon: 50.625273,
          photos: PHOTO_URLS.moloko, notifyNeighbors: true
        },
        {
          userId: galinaUser.id, title: 'Домашний творог',
          description: 'Натуральный творог из коровьего молока. Без добавок.',
          price: 200, category: 'Молочные продукты', district: 'Промышленный',
          contact: galinaUser.phone, lat: 53.232085, lon: 50.625273,
          photos: PHOTO_URLS.tvorog, notifyNeighbors: true
        },
        {
          userId: galinaUser.id, title: 'Домашняя сметана',
          description: 'Густая жирная сметана. Снимаю с молока.',
          price: 150, category: 'Молочные продукты', district: 'Промышленный',
          contact: galinaUser.phone, lat: 53.232085, lon: 50.625273,
          photos: PHOTO_URLS.smetana, notifyNeighbors: true
        }
      ];

      for (const postData of allPosts) {
        const post = await Post.create({ id: nanoid(), ...postData, createdAt: formatDate() });
        const user = users.find(u => u.id === postData.userId);
        console.log(`    ${user?.name}: "${post.title}" — ${post.price}₽`);
      }
      console.log('');
    }

    // ─── ЖАЛОБЫ ─────────────────────────────────────────────────

    console.log(' Создание жалоб...');
    const existingReports = await Report.count();

    if (existingReports > 0) {
      console.log(`  В базе уже есть ${existingReports} жалоб, пропускаем\n`);
    } else {
      const posts = await Post.findAll();
      const vasiliyPost = posts.find(p => p.userId === vasiliyUser.id);
      const galinaPost  = posts.find(p => p.userId === galinaUser.id);

      // Точные значения из ReportReason enum в constants.ts:
      // 'Спам', 'Мошенничество', 'Неприемлемый контент', 'Оскорбления', 'Другая причина'
      // Точные значения из ReportStatus enum:
      // 'В обработке', 'Просмотрено', 'Решено', 'Отклонено'
      const reports = [
        // Галина → Василий, «В обработке» (для TC-ADM-08 фильтрация по статусу)
        {
          id: nanoid(),
          reporterId: galinaUser.id,
          reportedUserId: vasiliyUser.id,
          postId: vasiliyPost?.id || null,
          reason: 'Спам',
          description: 'Пользователь спамит одинаковыми объявлениями',
          status: 'В обработке',
          adminComment: null,
          createdAt: formatDate()
        },
        // Василий → Галина, «В обработке» (второй элемент — фильтр работает)
        {
          id: nanoid(),
          reporterId: vasiliyUser.id,
          reportedUserId: galinaUser.id,
          postId: galinaPost?.id || null,
          reason: 'Мошенничество',
          description: 'Подозрительная активность',
          status: 'В обработке',
          adminComment: null,
          createdAt: formatDate()
        },
        // Галина → Василий, «Решено» (TC-ADM-09: обработка жалобы)
        {
          id: nanoid(),
          reporterId: galinaUser.id,
          reportedUserId: vasiliyUser.id,
          postId: null,
          reason: 'Неприемлемый контент',
          description: 'Содержание не соответствует правилам',
          status: 'Решено',
          adminComment: 'Проверено, нарушений нет',
          createdAt: formatDate()
        },
        // Василий → Галина, «Отклонено»
        {
          id: nanoid(),
          reporterId: vasiliyUser.id,
          reportedUserId: galinaUser.id,
          postId: null,
          reason: 'Оскорбления',
          description: 'Оскорбительные высказывания в объявлении',
          status: 'Отклонено',
          adminComment: 'Жалоба не подтверждена',
          createdAt: formatDate()
        }
      ];

      for (const reportData of reports) {
        await Report.create(reportData);
        const reporter = users.find(u => u.id === reportData.reporterId);
        const reported = users.find(u => u.id === reportData.reportedUserId);
        console.log(`    ${reporter?.name} → ${reported?.name} [${reportData.status}] (${reportData.reason})`);
      }
      console.log('');
    }

    // ─── ИТОГ ───────────────────────────────────────────────────

    const totalUsers   = await User.count();
    const totalPosts   = await Post.count();
    const totalReports = await Report.count();

    console.log(' СТАТИСТИКА:');
    console.log(`    Пользователей: ${totalUsers}`);
    console.log(`    Объявлений:    ${totalPosts}`);
    console.log(`    Жалоб:         ${totalReports}`);

    console.log('\n ДАННЫЕ ДЛЯ ВХОДА:');
    console.log('┌────────────────────────────────────────┐');
    console.log('│ Василий:                               │');
    console.log('│   Телефон: +79001234567                │');
    console.log('│   Пароль: 123456                       │');
    console.log('├────────────────────────────────────────┤');
    console.log('│ Галина:                                │');
    console.log('│   Телефон: +79009876543                │');
    console.log('│   Пароль: 123456                       │');
    console.log('├────────────────────────────────────────┤');
    console.log('│ Заблокированный (для тестов):          │');
    console.log('│   Телефон: +79009000000                │');
    console.log('│   Пароль: 123456  isBlocked: true      │');
    console.log('├────────────────────────────────────────┤');
    console.log('│ Администратор:                         │');
    console.log('│   Телефон: +79005555555                │');
    console.log('│   Пароль: 555555                       │');
    console.log('└────────────────────────────────────────┘');

    console.log('\n Seed завершен успешно!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n Ошибка:', error);
    process.exit(1);
  }
}

seedProductionDataWithPhotos();