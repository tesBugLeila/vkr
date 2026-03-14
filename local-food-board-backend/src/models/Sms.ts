import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ISms } from '../types/models';

/**
 * Интерфейс для создания логирования отправленных SMS
 * Указывает, какие поля необязательны при создании записи в базе данных
 */
interface SmsCreationAttributes extends Optional<
  ISms,
  'phone' | 'text' | 'sendAt'
> {}

/**
 * Класс модели Sms
 * Наследуется от Sequelize Model и реализует интерфейс ISms
 */
class Sms extends Model<ISms, SmsCreationAttributes> implements ISms {
  public phone!: string;
  public text!: string;
  public sendAt!: string;
}

/**
 * Инициализация модели Sms
 * Настройка полей таблицы и типов данных
 */
Sms.init(
  {
    phone: {
      type: DataTypes.STRING,      // Тип поля: строка
      allowNull: false,            // Обязательное поле
    },
    text: {
      type: DataTypes.STRING,      // Тип поля: строка
      allowNull: true              // Может быть null
    },
    sendAt: {
      type: DataTypes.STRING, //  для хранения формата "14.12.2025 15:30"
      allowNull: false
    }
  },
 { 
    sequelize,
    tableName: 'sms',
    modelName: 'Sms',
    timestamps: false,
  }
);

export default Sms;