import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { MAX_PHOTOS, MAX_FILE_SIZE } from '../utils/constants';

const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(` Создана папка: ${uploadDir}`);
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

// валидация файлов
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter(req, file, cb) {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = /image\/(jpeg|jpg|png|webp)/;
    
    if (allowed.test(ext) && mimeType.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения (jpg, png, webp)'));
    }
  }
});

export default upload;