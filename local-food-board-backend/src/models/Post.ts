import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IPost } from '../types/models';

interface PostCreationAttributes
  extends Optional<IPost, 'id' | 'description' | 'price' | 'category' | 'district' | 'photos' | 'lat' | 'lon' | 'notifyNeighbors' | 'createdAt'> {}

class Post extends Model<IPost, PostCreationAttributes> implements IPost {
  public id!: string;
  public title!: string;
  public description!: string;
  public price!: number;
  public contact!: string;
  public category!: string;
  public district!: string;
  public photos!: string[];
  public lat!: number | null;
  public lon!: number | null;
  public notifyNeighbors!: boolean;
  public userId!: string;
  public createdAt!: string;
}

Post.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    contact: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(50),
      defaultValue: 'other'
    },
    district: {
      type: DataTypes.STRING(100),
      defaultValue: ''
    },
    photos: {
      type: DataTypes.TEXT, // ✅ TEXT вместо JSONB для SQLite
      defaultValue: '[]',
      get(this: any) {
        const raw = this.getDataValue('photos') as string;
        return raw ? JSON.parse(raw) : [];
      },
      set(this: any, val: string[]) {
        this.setDataValue('photos', JSON.stringify(val || []));
      }
    },
    lat: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    lon: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    notifyNeighbors: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    userId: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'posts',
    modelName: 'Post',
    timestamps: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['category'] },
      { fields: ['district'] },
      { fields: ['createdAt'] }
    ]
  }
);

export default Post;
