import {DataTypes, Model, Optional} from 'sequelize';
import sequelize from '../../config/postgres';
import Equipment from './Equipment';

interface MaintenanceAttributes {
    id: number;
    equipmentId: number;
    type: 'ROUTINE' | 'REPAIR' | 'INSPECTION';
    scheduledAt: Date;
    completedAt?: Date;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    notes?: string;
}

interface MaintenanceCreationAttributes extends Optional<MaintenanceAttributes, 'id' | 'status'>{}

class Maintenance extends Model<MaintenanceAttributes, MaintenanceCreationAttributes> implements MaintenanceAttributes {
    public id!: number;
    public equipmentId!: number;
    public type!: 'ROUTINE' | 'REPAIR' | 'INSPECTION';
    public scheduledAt!: Date;
    public completedAt?: Date;
    public status!: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    public notes?: string;
}

Maintenance.init(
    {
        id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
        equipmentId: {type: DataTypes.INTEGER, allowNull: false, references: {model: Equipment, key: 'id'}},
        type: {type: DataTypes.ENUM('ROUTINE','REPAIR','INSPECTION'), allowNull: false},
        scheduledAt: {type: DataTypes.DATE, allowNull: false},
        completedAt: {type: DataTypes.DATE},
        status: {type: DataTypes.ENUM('PENDING','IN_PROGRESS','COMPLETED','CANCELLED'), defaultValue: 'PENDING'},
        notes: {type: DataTypes.TEXT}
    },
    {sequelize, modelName: 'Maintenance', tableName: 'maintenance'}
);

Equipment.hasMany(Maintenance, {foreignKey: 'equipmentId', as: 'maintenanceRecords'});
Maintenance.belongsTo(Equipment, {foreignKey: 'equipmentId', as: 'equipment'});

export default Maintenance;