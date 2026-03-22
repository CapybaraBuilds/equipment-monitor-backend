import Equipment from '../models/pg/Equipment';

// No id (auto-generated) or status (default: 'ONLINE') when creating a equipment
export type CreateEquipmentDto = Omit<Equipment, 'id' | 'status'> & {
    // index access type
    status?: Equipment['status'];
};

// id and equipmentId are immutable for updation, while other fields are optional
export type UpdateEquipmentDto = Partial<Omit<Equipment, 'id'|'equipmentId'>>;

// only show equipmentId in API response, no id.
export type EquipmentResponse = Omit<Equipment, 'id'>;