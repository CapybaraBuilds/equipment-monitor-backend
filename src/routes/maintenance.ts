import {Router, Request, Response} from 'express';
import Maintenance from '../models/pg/Maintenance';
import Equipment from '../models/pg/Equipment';
import {Op} from 'sequelize';
import { handleAppError } from '../types/errors';
import { CreateMaintenanceDto } from '../types/maintenance';

const router = Router();

// GET /maintenance/upcoming?days=7 get maintenance plans for the upcoming N days
const getUpcomingMaintenanceHandler = async( req: Request, res: Response) => {
    try{
        const days = Number(req.query.days) || 7;
        const until = new Date();
        until.setDate(until.getDate() + days);

        const records = await Maintenance.findAll({
            where: {
                scheduledAt: {[Op.between]: [new Date(), until]},
            },
            include: [{model: Equipment, as: 'equipment', attributes: ['equipmentId', 'name', 'location']}],
            order: [['scheduledAt', 'ASC']],
        });
        res.json(records);
    }catch(err: any){
        handleAppError({kind: 'DB_ERROR', message: 'Database Error', detail: err.message},res);
    }
}

// POST /maintenance - Create maintenance plans
const createMaintenanceHandler = async (req: Request, res: Response) => {
    try{
        const body = req.body as CreateMaintenanceDto;
        const {equipmentId: equipmentDbId, type, scheduledAt, notes} = body;
        const record = await Maintenance.create({
            equipmentId: equipmentDbId,
            type,
            scheduledAt: new Date(scheduledAt),
            notes,
        });
        res.status(201).json(record);
    }catch(err: any){
        handleAppError({kind: 'DB_ERROR', message: 'Database Error', detail: err.message},res);
    }
}

// PATCH /maintenance/:id/status - Update maintenance status
const updateStatusHandler = async (req: Request, res: Response) => {
    try{
        const {status} = req.body;
        const [updated] = await Maintenance.update(
            {status, ...(status === 'COMPLETED' ? {completedAt: new Date()}: {})},
            {where: {id: req.params.id}}
        );
        if (updated === 0) return handleAppError({kind: 'NOT_FOUND', message: 'Record Not Found!', resource: req.params.id.toString()}, res);
        res.json({message: 'Status updated!'});
    }catch(err: any){
        handleAppError({kind: 'DB_ERROR', message: 'Database Error', detail: err.message},res);
    }
}


router.get('/upcoming', getUpcomingMaintenanceHandler);
router.post('/', createMaintenanceHandler);
router.patch('/:id/status', updateStatusHandler);

export default router;
