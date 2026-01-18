import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IReport } from '../types/models';
import { ReportStatus, ReportReason } from '../utils/constants';

interface ReportCreationAttributes extends Optional<
  IReport,
  'id' | 'postId' | 'description' | 'status' | 'adminComment' | 'updatedAt' | 'createdAt'
> {}

/**
 * Модель жалоб на пользователей
 * Используется для черного списка
 */
class Report extends Model<IReport, ReportCreationAttributes> implements IReport {
  public id!: string;
  public reporterId!: string;          // Кто пожаловался
  public reportedUserId!: string;      // На кого пожаловались
  public postId!: string | null;       // Связанный пост (опционально)
  public reason!: string;              // Причина жалобы
  public description!: string;         // Описание
  public status!: string;              // Статус: pending, reviewed, resolved, rejected
  public adminComment!: string | null; // Комментарий админа
  public createdAt!: string;
  public updatedAt!: string | null;
}

Report.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    reporterId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'ID пользователя, который пожаловался'
    },
    reportedUserId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'ID пользователя, на которого пожаловались'
    },
    postId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'ID поста (если жалоба на пост)'
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [[
          ReportReason.SPAM,
          ReportReason.FRAUD,
          ReportReason.INAPPROPRIATE,
          ReportReason.OFFENSIVE,
          ReportReason.OTHER
        ]]
      },
      comment: 'Причина: spam, fraud, inappropriate, offensive, other'
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
      comment: 'Дополнительное описание'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: ReportStatus.PENDING,
      validate: {
        isIn: [[
          ReportStatus.PENDING,
          ReportStatus.REVIEWED,
          ReportStatus.RESOLVED,
          ReportStatus.REJECTED
        ]]
      },
      comment: 'Статус обработки жалобы'
    },
    adminComment: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Комментарий администратора'
    },
    createdAt: {
      type: DataTypes.STRING,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'reports',
    modelName: 'Report',
    timestamps: false,
    indexes: [
      { fields: ['reporterId'] },
      { fields: ['reportedUserId'] },
      { fields: ['postId'] },
      { fields: ['status'] },
      { fields: ['createdAt'] }
    ]
  }
);

export default Report;