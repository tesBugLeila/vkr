import { User, Post } from '../models';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { formatDate } from '../utils/dateFormatter';
import sequelize from '../config/database';

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
    console.log(' Начинаем заполнение базы данных с фото...\n');

    await sequelize.authenticate();
    console.log('Подключение к базе данных установлено');

    await sequelize.sync();
    console.log(' Модели синхронизированы\n');

    console.log(' Создание пользователей...');

    const existingUsers = await User.count();
    
    if (existingUsers === 0) {
      // Создаём новых пользователей
      const vasiliy = await User.create({
        id: nanoid(),
        phone: '+79001234567',
        password: await bcrypt.hash('123456', 10),
        name: 'Василий',
        role: 'user',
        isBlocked: false,
        notificationRadius: 5000,
        lastLat: 53.227085,
        lastLon: 50.621273,
        lastLocationUpdate: formatDate(),
        createdAt: formatDate()
      });
      console.log(` ${vasiliy.name}`);

      const galina = await User.create({
        id: nanoid(),
        phone: '+79009876543',
        password: await bcrypt.hash('123456', 10),
        name: 'Галина',
        role: 'user',
        isBlocked: false,
        notificationRadius: 10000,
        lastLat: 53.232085,
        lastLon: 50.625273,
        lastLocationUpdate: formatDate(),
        createdAt: formatDate()
      });
      console.log(` ${galina.name}`);

      const admin = await User.create({
        id: nanoid(),
        phone: '+79005555555',
        password: await bcrypt.hash('555555', 10),
        name: 'Администратор',
        role: 'admin',
        isBlocked: false,
        notificationRadius: 50000,
        lastLat: 53.220085,
        lastLon: 50.615273,
        lastLocationUpdate: formatDate(),
        createdAt: formatDate()
      });
      console.log(` ${admin.name}\n`);
    } else {
      console.log(`  В базе уже есть ${existingUsers} пользователей\n`);
    }

    //  ПОЛУЧАЕМ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ
    const users = await User.findAll();
    
    console.log(' Найденные пользователи:');
    users.forEach(u => {
      console.log(`   - ${u.name} (${u.phone}) - role: ${u.role}`);
    });
    console.log('');

    //  ИЩЕМ ПОЛЬЗОВАТЕЛЕЙ ПО РАЗНЫМ КРИТЕРИЯМ
    const vasiliyUser = users.find(u => 
      u.name === 'Василий' || u.phone === '+79001234567'
    );
    
    const galinaUser = users.find(u => 
      u.name === 'Галина' || u.phone === '+79009876543'
    );
    
    const adminUser = users.find(u => 
      u.role === 'admin' || u.phone === '+79005555555'
    );

    //  ПРОВЕРЯЕМ ЧТО ВСЕ НАЙДЕНЫ
    if (!vasiliyUser) {
      console.error('❌ Пользователь "Василий" не найден!');
      console.log(' Создайте пользователя с телефоном +79001234567');
      process.exit(1);
    }

    if (!galinaUser) {
      console.error(' Пользователь "Галина" не найдена!');
      console.log(' Создайте пользователя с телефоном +79009876543');
      process.exit(1);
    }

    if (!adminUser) {
      console.error(' Администратор не найден!');
      console.log(' Создайте пользователя с ролью admin');
      process.exit(1);
    }

    console.log(' Все необходимые пользователи найдены\n');
    console.log(' Создание объявлений с фото...\n');

    // Проверяем есть ли уже посты
    const existingPosts = await Post.count();
    if (existingPosts > 0) {
      console.log(`  В базе уже есть ${existingPosts} объявлений`);
      console.log('   Пропускаем создание постов...\n');
    } else {
      const allPosts = [
        // Василий
        {
          userId: vasiliyUser.id,
          title: 'Домашняя колбаса',
          description: 'Продаю домашнюю колбасу из свинины. Без добавок и консервантов. Очень вкусная!',
          price: 450,
          category: 'Мясо',
          district: 'Промышленный',
          contact: vasiliyUser.phone,
          lat: 53.227085,
          lon: 50.621273,
          photos: PHOTO_URLS.kolbasa,
          notifyNeighbors: true
        },
        {
          userId: vasiliyUser.id,
          title: 'Копченая грудинка',
          description: 'Свежая копченая грудинка собственного производства. Коптил на яблоне.',
          price: 550,
          category: 'Мясо',
          district: 'Промышленный',
          contact: vasiliyUser.phone,
          lat: 53.227085,
          lon: 50.621273,
          photos: PHOTO_URLS.grudinka,
          notifyNeighbors: true
        },
        {
          userId: vasiliyUser.id,
          title: 'Домашнее сало',
          description: 'Отличное сало с прослойкой. Хорошо просолено с чесноком.',
          price: 350,
          category: 'Мясо',
          district: 'Промышленный',
          contact: vasiliyUser.phone,
          lat: 53.227085,
          lon: 50.621273,
          photos: PHOTO_URLS.salo,
          notifyNeighbors: false
        },
        // Галина
        {
          userId: galinaUser.id,
          title: 'Свежее коровье молоко',
          description: 'Парное молоко от домашней коровы. Надой сегодня утром.',
          price: 80,
          category: 'Молочные продукты',
          district: 'Промышленный',
          contact: galinaUser.phone,
          lat: 53.232085,
          lon: 50.625273,
          photos: PHOTO_URLS.moloko,
          notifyNeighbors: true
        },
        {
          userId: galinaUser.id,
          title: 'Домашний творог',
          description: 'Натуральный творог из коровьего молока. Без добавок.',
          price: 200,
          category: 'Молочные продукты',
          district: 'Промышленный',
          contact: galinaUser.phone,
          lat: 53.232085,
          lon: 50.625273,
          photos: PHOTO_URLS.tvorog,
          notifyNeighbors: true
        },
        {
          userId: galinaUser.id,
          title: 'Домашняя сметана',
          description: 'Густая жирная сметана. Снимаю с молока.',
          price: 150,
          category: 'Молочные продукты',
          district: 'Промышленный',
          contact: galinaUser.phone,
          lat: 53.232085,
          lon: 50.625273,
          photos: PHOTO_URLS.smetana,
          notifyNeighbors: true
        }
      ];

      for (const postData of allPosts) {
        const post = await Post.create({
          id: nanoid(),
          ...postData,
          createdAt: formatDate()
        });
        const user = users.find(u => u.id === postData.userId);
        console.log(`    ${user?.name}: "${post.title}" - ${post.price}₽ (${post.photos.length} фото)`);
      }
    }

    const totalUsers = await User.count();
    const totalPosts = await Post.count();
    
    console.log('\n Все данные успешно созданы!');
    console.log('\n СТАТИСТИКА:');
    console.log(`    Пользователей: ${totalUsers}`);
    console.log(`    Объявлений: ${totalPosts}`);
    
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