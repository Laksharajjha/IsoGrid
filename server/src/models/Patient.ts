import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Bed from './Bed';

class Patient extends Model {
    public id!: number;
    public name!: string;
    public age!: number;
    public condition!: 'INFECTIOUS' | 'NON_INFECTIOUS';
    public admissionDate!: Date;
    public bedId!: number | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Patient.init(
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
        age: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        condition: {
            type: DataTypes.ENUM('INFECTIOUS', 'NON_INFECTIOUS'),
            allowNull: false,
        },
        admissionDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        bedId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: Bed,
                key: 'id',
            },
        },
    },
    {
        sequelize,
        tableName: 'patients',
    }
);

export default Patient;
