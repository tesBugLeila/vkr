export interface IPost {
  id: string; // Уникальный идентификатор поста
  title: string; // Заголовок поста
  description: string; // Описание поста
  price: number; // Цена
  contact: string; // Контактная информация
  category: string; // Категория поста
  district: string; // Район/местоположение
  photos: string[]; // Массив ссылок на фотографии
  lat: number | null; // Широта (координата)
  lon: number | null; // Долгота (координата)
  notifyNeighbors: boolean; // Уведомление соседей
  userId: string | null; // ID пользователя, автора поста
  createdAt: Date; // Время создания (timestamp)
}
