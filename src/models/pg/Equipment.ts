import { Model, Optional, DataTypes} from 'sequelize';
import sequelize from '../../config/postgres';

interface EquipmentAttributes {
    id: number;
    equipmentId: string;
    name: string;
    model: string;
    location: string;
    status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR';
    installedAt: Date;
    assignedTo?: string;
}

interface EquipmentCreationAttributes extends Optional<EquipmentAttributes, 'id' | 'status' | 'assignedTo'> {}

class Equipment extends Model<EquipmentAttributes, EquipmentCreationAttributes> implements EquipmentAttributes{
    public id!: number;
    public equipmentId!: string;
    public name!: string;
    public model!: string;
    public location!: string;
    public status!: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR';
    public installedAt!: Date;
    public assignedTo?: string;
}

Equipment.init(
    {
        id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
        equipmentId: {type: DataTypes.STRING(20), allowNull: false, unique: true},
        name: {type: DataTypes.STRING(100), allowNull: false},
        model: {type: DataTypes.STRING(100), allowNull: false},
        location: {type: DataTypes.STRING(200), allowNull: false},
        status: {
            type: DataTypes.ENUM('ONLINE','OFFLINE','MAINTENANCE','ERROR'),
            defaultValue: 'ONLINE'
        },
        installedAt: {type: DataTypes.DATE, allowNull: false},
        assignedTo: {type: DataTypes.STRING(100)}
    },
    {sequelize, modelName: 'Equipment', tableName: 'equipment'}
);

export default Equipment;