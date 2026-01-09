
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IUser } from '../types/models';
import { UserRole } from '../utils/constants';

interface UserCreationAttributes
  extends Optional<IUser, 'id' | 'email' | 'role' | 'isBlocked' | 'verified' | 'createdAt'> {}

class User extends Model<IUser, UserCreationAttributes> implements IUser {
  public id!: string;
  public phone!: string;
  public password!: string;
  public name!: string;
  public email!: string | null;
  public role!: string;
  public isBlocked!: boolean;
  public verified!: boolean;
  public createdAt!: string;
}

User.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    role: {
      type: DataTypes.STRING(20), // ✅ STRING вместо ENUM для SQLite
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
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.STRING(50),
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
      { fields: ['email'] },
      { fields: ['role'] }
    ]
  }
);

export default User;