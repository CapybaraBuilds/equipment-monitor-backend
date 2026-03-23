import {Router, Request, Response} from 'express';
import SensorData from '../models/mongo/SensorData';
import { getRecentAlerts } from '../services/alertService';

const router = Router();

// GET /sensor/alerts - Get the newest alert list
const getRecentAlertsHandler = (req: Request, res: Response) =>{
    const {severity, equipmentId} = req.query;
    let alerts = getRecentAlerts();
    if (severity) alerts = alerts.filter(alert => alert.severity === severity);
    if (equipmentId) alerts = alerts.filter(alert => alert.equipmentId === equipmentId);
    res.json(alerts);
}

// GET /sensor/:equipmentId/latest Get the newest sensor data of a specific equipment
const getNewestSensorDataByEquipmentIdHandler = async (req: Request, res: Response) => {
    try{
        const data = await SensorData.findOne(
            {equipmentId: req.params.equipmentId},
            null,
            {sort: {timestamp: -1}} // the newest data
        );
        if (!data) return res.status(404).json({error: 'No Sensor Data Found!'});
        res.json(data)
    }catch(err: any){
        res.status(500).json({error: err.message});
    }
}

// GET /sensor/:equipmentId/history?from=2026-03-14&to=2026-3-15 Get the sensor data in a specific time range of a specific equipment
const getSensorDataByEquipmentIdWithTimeRangeHandler = async (req: Request, res: Response) => {
    try{
        const {from, to} = req.query;
        const query: any = { equipmentId: req.params.equipmentId};

        if(from || to){
            query.timestamp = {};
            if(from) query.timestamp.$gte = new Date(from as string);
            if(to) query.timestamp.$lte = new Date(to as string);
        }

        const data = await SensorData.find(query).sort({timestamp: -1}).limit(1000);

        res.json({count: data.length, data});
    }catch(err: any){
        res.status(500).json({error: err.message});
    }
}

// GET /sensor/:equipmentId/stats?from=2026-03-14&to=2026-3-15 Get min/max/avg of different types of sensor data in a specific time range
const getSensorDataSummaryWithTimeRangeHandler = async (req: Request, res: Response) => {
    try{
        const {from, to} = req.query;
        const matchStage: any = {equipmentId: req.params.equipmentId};

        if(from || to){
            matchStage.timestamp = {};
            if(from) matchStage.timestamp.$gte = new Date(from as string);
            if(to) matchStage.timestamp.$lte = new Date(to as string);
        }

        const stats = await SensorData.aggregate([
            {$match: matchStage},
            {$unwind: '$readings'},
            {$group: {
                _id: '$readings.type',
                avg: {$avg: '$readings.value'},
                max: {$max: '$readings.value'},
                min: {$min: '$readings.value'},
                count: {$sum: 1}
            }},
            {$project: {
                _id: 0, // hide id
                type: '$_id',
                avg: {$round: ['$avg', 2]},
                max: { $round: [ '$max', 2]},
                min: { $round: ['$min', 2]},
                count: 1 // show count as it is
            }}
        ])
        res.json({equipmentId: req.params.equipmentId, stats});
    }catch(err: any){
        res.status(500).json({error: err.message});
    }
};

router.get('/alerts', getRecentAlertsHandler)
router.get('/:equipmentId/latest', getNewestSensorDataByEquipmentIdHandler)
router.get('/:equipmentId/history', getSensorDataByEquipmentIdWithTimeRangeHandler)
router.get('/:equipmentId/stats', getSensorDataSummaryWithTimeRangeHandler)

export default router;