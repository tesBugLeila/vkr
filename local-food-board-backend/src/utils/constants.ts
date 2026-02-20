// Максимальное время жизни поста — 14 дней
export const POST_LIFETIME_MS = 14 * 24 * 60 * 60 * 1000;

// Интервал запуска фоновой очистки — каждые 5 минут
export const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

// Максимальное количество фотографий в одном посте
export const MAX_PHOTOS = 6;

// Максимальный размер одного файла — 5 МБ
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Радиус поиска по умолчанию — 5 километров
export const DEFAULT_SEARCH_RADIUS = 5000;

// Максимальное количество элементов в одном запросе
export const DEFAULT_LIMIT = 50;


// Роли пользователей
export enum UserRole {
  USER = 'user',           // Обычный пользователь
  ADMIN = 'admin'          // Администратор
}

export enum PostCategory {
  OTHER = 'Другое',
  PIES = 'Пироги',
  JAMS = 'Варенье и джемы',
  VEGETABLES = 'Овощи',
  DAIRY = 'Молочные продукты',
  MEAT = 'Мясо',
  BAKERY = 'Выпечка'
}


// Статусы жалоб
export enum ReportStatus {
  PENDING = 'В обработке',
  REVIEWED = 'Просмотрено',
  RESOLVED = 'Решено',
  REJECTED = 'Отклонено'
}


// ПРИЧИНЫ ЖАЛОБ
export enum ReportReason {
  SPAM = 'Спам',
  FRAUD = 'Мошенничество',
  INAPPROPRIATE = 'Неприемлемый контент',
  OFFENSIVE = 'Оскорбления',
  OTHER = 'Другая причина'
}
