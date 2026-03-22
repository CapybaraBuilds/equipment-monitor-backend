import {Router, Response, Request} from 'express';
import Equipment from '../models/pg/Equipment';
import Maintenance from '../models/pg/Maintenance';
import { handleAppError } from '../types/errors';
import type { AppError } from '../types/errors';
import type { CreateEquipmentDto, UpdateEquipmentDto, EquipmentResponse } from '../types/equipment';

const router = Router();

function toAppError(err:any): AppError {
    if (err.name === 'SequelizeUniqueConstraintError'){
        return {kind: 'DUPLICATE', message: 'Equipment ID already exists!', field: 'equipmentId'};
    }
    return {kind: 'DB_ERROR', message: 'Database Error', detail: err.message};
}

const getEquipmentHandler = async (req: Request, res: Response) => {
    try{
        const equipment = await Equipment.findAll({
            include: [{model: Maintenance, as: 'maintenanceRecords', limit: 1, order: [['scheduledAt', 'DESC']]}]
        });
        res.json(equipment);
    }catch(err: any){
        // res.status(500).json({error: err.message});
        handleAppError(toAppError(err),res);
    }
};

const getEquipmentByIdHandler = async (req: Request, res: Response) => {
    try{
        const equipment = await Equipment.findOne({
            where: {equipmentId: req.params.equipmentId},
            include: [{model: Maintenance, as: 'maintenanceRecords', order: [['scheduledAt', 'DESC']]}]
        });
        // if (!equipment) return res.status(404).json({error: 'Equipment Not Found!'});
        if(!equipment){
            handleAppError({kind: 'NOT_FOUND', message: 'Equipment Not Found!', resource: req.params.equipmentId.toString()}, res);
            return;
        }
        res.json(equipment);
    }catch(err: any){
        // res.status(500).json({error: err.message});
        handleAppError(toAppError(err),res);
    }
}

const createEquipmentHandler = async (req: Request, res: Response) => {
    try{
        const body = req.body as CreateEquipmentDto;
        const {equipmentId, name, model, location, status, installedAt, assignedTo} = body;
        const missingFields = ['equipmentId', 'name', 'model', 'location', 'installedAt'].filter(field => !req.body[field]);
        // if (!equipmentId || !name || !model || !location || !installedAt){
        //     return res.status(400).json({error: 'equipmentId, name, model, location, installedAt are required!'});
        // }
        if (missingFields.length > 0){
            handleAppError({kind: 'VALIDATION', message: 'Missing required fields!', fields: missingFields}, res);
            return;
        }
        const equipment = await Equipment.create({
            equipmentId,
            name,
            model,
            location,
            status,
            installedAt,
            assignedTo
        });
        res.status(201).json(equipment);
    }catch(err: any){
        // if (err.name === 'SequelizeUniqueConstraintError'){
        //     return res.status(400).json({error: 'Equipment ID already exists!'});
        // }
        // return res.status(500).json({error: err.message});
        handleAppError(toAppError(err),res);
    }
}

const updateStatusHandler = async (req: Request, res: Response) => {
    try{
        const body = req.body as UpdateEquipmentDto;
        const {status} = body;
        const validStatus = ['ONLINE','OFFLINE','MAINTENANCE','ERROR'];
        if(status && !validStatus.includes(status)){
            // return res.status(400).json({error: `status must be one of ${validStatus.join(',')}`});
            return handleAppError({kind: 'VALIDATION', message: `Invalid status!`, fields: ['status']}, res);
        }
        const [updated] = await Equipment.update(
            {status},
            {where: {equipmentId: req.params.equipmentId}}
        );
        // if(updated === 0) return res.status(404).json({error: 'Equipment Not Found!'});
        if(updated === 0){
            handleAppError({kind: 'NOT_FOUND', message: 'Equipment Not Found!', resource: req.params.equipmentId.toString()}, res);
            return;
        }
        res.json({message: 'Status updated', equipmentId: req.params.equipmentId, status});
    }catch (err: any){
        // res.status(500).json({error: err.message});
        handleAppError(toAppError(err),res);
    }
}

router.get('/', getEquipmentHandler);
router.get('/:equipmentId', getEquipmentByIdHandler);
router.post('/', createEquipmentHandler);
router.patch('/:equipmentId/status', updateStatusHandler);

export default router;