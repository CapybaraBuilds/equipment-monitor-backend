import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize, {connectPostgres} from './config/postgres';
import {connectMongoDB} from './config/mongodb';
import Equipment from './models/pg/Equipment';
import Maintenance from './models/pg/Maintenance';
import equipmentRouter from './routes/equipment';
import sensorRouter from './routes/sensor';
import maintenanceRouter from './routes/maintenance';
import { getRabbitMQChannel } from './rabbitmq/connection';
import { startConsumers } from './rabbitmq/consumer';
import { startSensorSimulator } from './rabbitmq/producer';
import { start } from 'repl';
import { etagMiddleware } from './middleware/etag';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(etagMiddleware);
app.use('/equipment', equipmentRouter);
app.use('/sensor', sensorRouter);
app.use('/maintenance', maintenanceRouter);

app.get('/health', (rea, res) => {
    res.json({status: 'ok', timestamp: new Date().toISOString()});
});

const startServer = async () => {
    await connectPostgres();
    await connectMongoDB();

    await sequelize.sync({alter: true});
    console.log('PostgresSQL tables synced');

    await getRabbitMQChannel();
    await startConsumers();

    const PORT = process.env.PORT;
    app.listen(PORT, ()=>{
        console.log(`Server running on port ${PORT}`);
        if(process.env.NODE_ENV === 'development'){
            startSensorSimulator();
        }
    })
};

startServer()