import sequelize from '../config/database';
import { User, Post } from '../models';

async function init() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // optional sample data
    const u = await User.create({
      id: 'user1',
      phone: '+70000000001',
      password: null,
      name: 'Sample User',
      verified: true,
      createdAt: Date.now()
    });

    await Post.create({
      id: 'post1',
      title: 'Домашние пирожки',
      description: 'Свежие пирожки, 10 штук',
      price: 300,
      contact: '+70000000001',
      category: 'baked',
      district: 'Центр',
      photos: [],
      lat: null,
      lon: null,
      notifyNeighbors: false,
      userId: u.id,
      createdAt: Date.now()
    });

    console.log('Sample data created');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

init();
