// Интерфейс, описывающий структуру пользователя в базе данных
export interface IUser {
  id: string;
  phone: string;
  password: string;
  name: string;
  role: string;
  isBlocked: boolean;
  lastLat?: number | null;       //  - последняя широта
  lastLon?: number | null;       //  - последняя долгота
  lastLocationUpdate?: string | null; // время последнего обновления геопозиции
  notificationRadius: number;  
  createdAt: string;
}

// Интерфейс для запроса регистрации нового пользователя
export interface IUserRegisterRequest {
  phone: string;            // Телефон для регистрации
  password: string;         // Пароль для регистрации
  name: string;            // Имя пользователя 
}

// Интерфейс для запроса логина пользователя
export interface IUserLoginRequest {
  phone: string;            // Телефон пользователя
  password: string;         // Пароль пользователя
}

// Интерфейс для ответа после успешной аутентификации
export interface IAuthResponse {
  user: {                   // Данные пользователя
    id: string;
    phone: string;
    name: string | null;
    role: string;
    isBlocked: boolean;     // Добавлено поле isBlocked
  };
  token: string;            // JWT токен для последующих запросов
}

// Интерфейс, описывающий структуру поста в базе данных
export interface IPost {
  id: string;               // Уникальный идентификатор поста
  title: string;            // Заголовок поста
  description?: string;     // Описание поста (необязательное)
  price: number;           // Цена 
  contact: string;          // Контактные данные автора
  category?: string;        // Категория поста (необязательное)
  district?: string;        // Район или локация (необязательное)
  photos?: string[];        // Массив ссылок на фотографии (необязательное)
  lat?: number | null;      // Широта (необязательное)
  lon?: number | null;      // Долгота (необязательное)
  notifyNeighbors?: boolean;// Флаг уведомления соседей (необязательное)
  userId: string;   // ID автора поста 
  createdAt: string;        // Изменено на string для формата "14.12.2025 15:30"
}

// Интерфейс для запроса на создание нового поста

export interface IPostCreateRequest {
  title: string;
  description?: string;
  price: number;
  contact: string;
  category?: string;
  district?: string;
  lat?: number;
  lon?: number;
  notifyNeighbors?: boolean;
  notificationRadius?: number;  
  userId?: string;
}
// Интерфейс для обновления поста (все поля опциональны)
export interface IPostUpdateRequest {
  title?: string;
  description?: string;
  price?: number;
  contact?: string;
  category?: string;
  district?: string;
  photos?: string[] | string;
  lat?: number;
  lon?: number;
  notifyNeighbors?: boolean;
}

export interface IReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  postId?: string | null;
  reason: string;
  description: string;
  status: string;
  adminComment?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

// Уведомления
export interface INotification {
  id: string;
  userId: string;              // Кому отправлено
  postId: string;              // Какой пост
  postTitle: string;           // Заголовок поста
  distance: number;            // Расстояние в метрах
  isRead: boolean;             // Прочитано ли
  createdAt: string;
}