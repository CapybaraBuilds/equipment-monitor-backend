import Maintenance from "../models/pg/Maintenance";

export type CreateMaintenanceDto = Omit<Maintenance, 'id' | 'status'> & {status?: Maintenance['status'];};
