import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IUser } from '../types/models';
import { UserRole } from '../utils/constants';

/**
 * Интерфейс для создания пользователя
 * Указывает, какие поля необязательны при создании записи в базе данных
 */
interface UserCreationAttributes extends Optional<
  IUser, 
  'id' | 'role' | 'isBlocked'  | 'lastLat' | 'lastLon' | 'lastLocationUpdate' | 'createdAt'
> {}

/**
 * Класс модели User
 * Наследуется от Sequelize Model и реализует интерфейс IUser
 */
class User extends Model<IUser, UserCreationAttributes> implements IUser {
  public id!: string;
  public phone!: string;
  public password!: string;
  public name!: string;
  public role!: string;
  public isBlocked!: boolean;
  public lastLat!: number | null;           
  public lastLon!: number | null;           
  public lastLocationUpdate!: string | null; 
  public notificationRadius!: number; 
  public createdAt!: string;
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
      role: {                            
      type: DataTypes.STRING,
      defaultValue: UserRole.USER,
      allowNull: false,
      validate: {
        isIn: [[UserRole.USER, UserRole.ADMIN]]
      }
    },
    isBlocked: {                       
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
   
    lastLat: {                              
      type: DataTypes.DOUBLE,
      allowNull: true,
      comment: 'Последняя известная широта пользователя'
    },
    lastLon: {                             
      type: DataTypes.DOUBLE,
      allowNull: true,
      comment: 'Последняя известная долгота пользователя'
    },
    lastLocationUpdate: {                   
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Время последнего обновления геолокации'
    },
 notificationRadius: {
      type: DataTypes.INTEGER,
      defaultValue: 5000,
      allowNull: false,
      comment: 'Радиус уведомлений в метрах'
    },

    createdAt: {
      type: DataTypes.STRING, //  для хранения формата "14.12.2025 15:30"
      allowNull: false
    }
  },
 { 
    sequelize,
    tableName: 'users',
    modelName: 'User',
    timestamps: false,
    indexes: [
      { fields: ['phone'], unique: true },
      { fields: ['role'] },
      { fields: ['lastLat', 'lastLon'] }    
    ]
  }
);

export default User;