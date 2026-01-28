import { IUser } from './user';
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
  user?: IUser | null; //  автор поста
  createdAt: string; // Время создания 
}

export interface IPostWrapper {
  post: IPost;
}

export interface IPostFilter {
  lat?: number;
  lon?: number;
  radius?: number;
  category?: string;
  district?: string;
  q?: string;
}
