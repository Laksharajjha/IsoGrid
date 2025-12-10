import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class ActivityLog extends Model {
    public id!: number;
    public message!: string;
    public type!: 'ADMISSION' | 'DISCHARGE' | 'MAINTENANCE' | 'SYSTEM';
    public readonly createdAt!: Date;
}

ActivityLog.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('ADMISSION', 'DISCHARGE', 'MAINTENANCE', 'SYSTEM'),
            defaultValue: 'SYSTEM',
        },
    },
    {
        sequelize,
        tableName: 'activity_logs',
    }
);

export default ActivityLog;
