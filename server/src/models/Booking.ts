import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Patient from './Patient';
import Bed from './Bed';

class Booking extends Model {
    public id!: number;
    public patientId!: number;
    public bedId!: number;
    public startDate!: Date;
    public endDate!: Date | null;
    public status!: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Booking.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        patientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Patient,
                key: 'id',
            },
        },
        bedId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Bed,
                key: 'id',
            },
        },
        startDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'CANCELLED'),
            defaultValue: 'ACTIVE',
        },
    },
    {
        sequelize,
        tableName: 'bookings',
    }
);

export default Booking;
