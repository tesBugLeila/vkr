import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IUser } from '../types/models';

/**
 * Интерфейс для создания пользователя
 * Указывает, какие поля необязательны при создании записи в базе данных
 */
interface UserCreationAttributes extends Optional<
  IUser, 
  'id' | 'name' | 'password' | 'verified' | 'createdAt'
> {}

/**
 * Класс модели User
 * Наследуется от Sequelize Model и реализует интерфейс IUser
 */
class User extends Model<IUser, UserCreationAttributes> implements IUser {
  public id!: string;              // Уникальный идентификатор пользователя
  public phone!: string;           // Телефон (логин)
  public password!: string; // Хэш пароля 
  public name!: string;     // Имя пользователя 
  public verified!: boolean;       // Флаг подтверждения учетной записи
  public createdAt!: string;       // Время создания пользователя (timestamp)
}

/**
 * Инициализация модели User
 * Настройка полей таблицы и типов данных
 */
User.init(
  {
    id: { 
      type: DataTypes.STRING,      // Тип поля: строка
      primaryKey: true             // Первичный ключ
    },
    phone: { 
      type: DataTypes.STRING,      // Тип поля: строка
      allowNull: false,            // Обязательное поле
      unique: true                 // Должно быть уникальным
    },
    password: { 
      type: DataTypes.STRING,      // Хэш пароля
      allowNull: true              // Может быть null
    },
    name: { 
      type: DataTypes.STRING,      // Имя пользователя
      allowNull: true              // Может быть null
    },
    verified: { 
      type: DataTypes.BOOLEAN,     // Флаг подтверждения
      defaultValue: false          // По умолчанию false
    },
    createdAt: {
      type: DataTypes.STRING, //  Изменено на STRING для хранения формата "14.12.2025 15:30"
      allowNull: false
    }
  },
  { 
    sequelize,                     // Подключение к базе данных
    tableName: 'users',            // Имя таблицы в базе
    modelName: 'User',             // Имя модели в Sequelize
    timestamps: false,             // Отключаем стандартные поля createdAt/updatedAt Sequelize
    indexes: [{ fields: ['phone'] }] //  Добавлен индекс
  }
);

export default User;
