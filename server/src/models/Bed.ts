import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Ward from './Ward';

class Bed extends Model {
    public id!: number;
    public wardId!: number;
    public row!: number;
    public col!: number;
    public status!: 'AVAILABLE' | 'OCCUPIED' | 'BLOCKED' | 'MAINTENANCE';
    public type!: 'REGULAR' | 'ICU';
    public maintenanceStartTime!: Date | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Bed.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        wardId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Ward,
                key: 'id',
            },
        },
        row: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        col: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('AVAILABLE', 'OCCUPIED', 'BLOCKED', 'MAINTENANCE'),
            defaultValue: 'AVAILABLE',
        },
        type: {
            type: DataTypes.ENUM('REGULAR', 'ICU'),
            defaultValue: 'REGULAR',
        },
        maintenanceStartTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'beds',
    }
);

export default Bed;
