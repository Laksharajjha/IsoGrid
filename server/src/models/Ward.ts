import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Ward extends Model {
  public id!: number;
  public name!: string;
  public type!: string;
  public rowCount!: number;
  public colCount!: number;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Ward.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rowCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    colCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'wards',
  }
);

export default Ward;
