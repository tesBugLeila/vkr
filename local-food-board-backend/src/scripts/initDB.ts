import sequelize from '../config/database';
import { User, Post } from '../models';
import { formatDate } from '../utils/dateFormatter';

async function init() {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ База данных синхронизирована');

    const u = await User.create({
      id: 'user1',
      phone: '+70000000001',
      password: '123456',
      name: 'Тестовый пользователь',
      
      createdAt: formatDate()
    });

    await Post.create({
      id: 'post1',
      title: 'Домашние пирожки',
      description: 'Свежие пирожки с мясом, 10 штук',
      price: 300,
      contact: '+70000000001',
      category: 'Пироги',
      district: 'Центр',
      photos: [],
      lat: 56.8389,
      lon: 60.6057,
      notifyNeighbors: false,
      userId: u.id,
      createdAt: formatDate()
    });

    console.log('✅ Тестовые данные созданы');
    process.exit(0);
  } catch (e) {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  }
}

init();