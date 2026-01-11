import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IPost } from '../types/models';

/**
 * Интерфейс для создания поста
 * Указывает, какие поля необязательные при создании записи в базе данных
 */
interface PostCreationAttributes extends Optional<
  IPost, 
  'id' | 'description' | 'price' | 'category' | 'district' | 'photos' | 'lat' | 'lon' | 'notifyNeighbors' | 'userId' | 'createdAt'
> {}

/**
 * Класс модели Post
 * Наследуется от Sequelize Model и реализует интерфейс IPost
 */
class Post extends Model<IPost, PostCreationAttributes> implements IPost {
  public id!: string;              // Уникальный идентификатор поста
  public title!: string;           // Заголовок поста
  public description!: string;     // Описание поста
  public price!: number;           // Цена
  public contact!: string;         // Контактная информация
  public category!: string;        // Категория поста
  public district!: string;        // Район/местоположение

  public photos!: string[];        // Массив ссылок на фотографии
  public lat!: number | null;      // Широта (координата)
  public lon!: number | null;      // Долгота (координата)
  public notifyNeighbors!: boolean; // Уведомление соседей
  public userId!: string;   // ID пользователя, автора поста
  public createdAt!: string;       // Время создания
}

/**
 * Инициализация модели Post
 * Настройка полей таблицы и типов данных
 */
Post.init(
  {
    
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    }, // Заголовок обязателен
   description: {
      type: DataTypes.TEXT,
      defaultValue: ''
    }, // Описание по умолчанию пустое
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    }, // Цена по умолчанию 0
    contact: {
      type: DataTypes.STRING,
      allowNull: false
    }, // Контакт обязателен
    category: {
      type: DataTypes.STRING,
      defaultValue: 'Другое'
    }, // Категория по умолчанию "Другое"
    district: {
      type: DataTypes.STRING,
      defaultValue: ''
    }, // Район по умолчанию пустой
    photos: { 
      type: DataTypes.TEXT, 
      defaultValue: '[]', 
      get(this: any) { 
        // Преобразуем JSON-строку в массив
        const raw = this.getDataValue('photos') as string;
        return raw ? JSON.parse(raw) : [];
      }, 
      set(this: any, val: string[]) { 
        // Сохраняем массив как JSON-строку
        this.setDataValue('photos', JSON.stringify(val || []));
      } 
    },
    lat: { type: DataTypes.FLOAT, allowNull: true }, // Широта может быть null
    lon: { type: DataTypes.FLOAT, allowNull: true }, // Долгота может быть null
    notifyNeighbors: { type: DataTypes.BOOLEAN, defaultValue: false }, // По умолчанию уведомление выключено
    userId: { type: DataTypes.STRING, allowNull: false }, // ID автора поста
    createdAt: {
      type: DataTypes.STRING, //  Изменено на STRING для хранения формата "14.12.2025 15:30"
      allowNull: false
    }
  },
  { 
    sequelize,               // Подключение к базе данных
    tableName: 'posts',      // Имя таблицы в базе
    modelName: 'Post',       // Имя модели в Sequelize
timestamps: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['category'] },
      { fields: ['district'] },
      { fields: ['createdAt'] }
    ] //  Добавлены индексы
  }
);

export default Post;

