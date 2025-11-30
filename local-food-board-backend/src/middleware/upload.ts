import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Папка, куда будут сохраняться загружаемые файлы
const uploadDir = path.join(process.cwd(), 'uploads');

// Если папка не существует — создаём её рекурсивно
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Папка для загрузок создана: ${uploadDir}`);
}

// Настройка хранилища для multer
const storage = multer.diskStorage({
  // Функция для указания папки назначения файлов
  destination(req, file, cb) {
    cb(null, uploadDir);
  },

  // Функция для генерации имени файла
  filename(req, file, cb) {
    // Генерируем уникальное имя: timestamp + случайное число
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Добавляем расширение оригинального файла
    cb(null, unique + path.extname(file.originalname));
  }
});

// Создаём middleware для загрузки файлов с настройками хранилища
const upload = multer({ storage });

// Экспортируем middleware, чтобы использовать его в роутинге
export default upload;
