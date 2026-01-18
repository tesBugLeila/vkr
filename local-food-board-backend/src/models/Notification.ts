
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { INotification } from '../types/models';

interface NotificationCreationAttributes extends Optional<
  INotification, 
  'id' | 'isRead' | 'createdAt'
> {}

/**
 * Модель уведомлений для соседей
 * Когда создаётся новый пост рядом, пользователи получают уведомление
 */
class Notification extends Model<INotification, NotificationCreationAttributes> 
  implements INotification {
  public id!: string;
  public userId!: string;
  public postId!: string;
  public postTitle!: string;
  public distance!: number;
  public isRead!: boolean;
  public createdAt!: string;
}

Notification.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'ID пользователя, которому отправлено уведомление'
    },
    postId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'ID поста, о котором уведомление'
    },
    postTitle: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Заголовок поста для быстрого отображения'
    },
    distance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Расстояние до поста в метрах'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Прочитано ли уведомление'
    },
    createdAt: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'notifications',
    modelName: 'Notification',
    timestamps: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['postId'] },
      { fields: ['isRead'] },
      { fields: ['createdAt'] }
    ]
  }
);

export default Notification;