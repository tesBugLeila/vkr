// Максимальное время жизни поста — 24 часа
export const POST_LIFETIME_MS = 24 * 60 * 60 * 1000;

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


export enum PostCategory {
  OTHER = 'Другое',
  PIES = 'Пироги',
  JAMS = 'Варенье и джемы',
  VEGETABLES = 'Овощи',
  DAIRY = 'Молочные продукты',
  MEAT = 'Мясо',
  BAKERY = 'Выпечка'
}
