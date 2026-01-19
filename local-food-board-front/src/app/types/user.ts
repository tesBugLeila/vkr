export interface IUser {
  id: string; // Уникальный идентификатор пользователя
  phone: string; // Телефон (логин)
  password: string | null; // Хэш пароля (может быть null)
  name: string | null; // Имя пользователя (может быть null)
  verified: boolean; // Флаг подтверждения учетной записи
  role: 'user' | 'admin'; // Роли пользователей;
  createdAt: Date;
}
export interface IUserResp {
  token?: string;
  user: IUser;
}
