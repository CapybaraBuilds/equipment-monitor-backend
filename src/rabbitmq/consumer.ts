import { getRabbitMQChannel } from "./connection";
import { checkAndAlert, Alert } from "../services/alertService";
import SensorData from "../models/mongo/SensorData";

export const startConsumers = async (): Promise<void> => {
    const channel = await getRabbitMQChannel();

    // Consumer 1: process sensor data, store in MongoDB, check alert, acknowledgement messages
    channel.prefetch(10) // 10 messages each time
    channel.consume('sensor_data', async(msg)=>{
        if(!msg) return;
        try{
            const data = JSON.parse(msg.content.toString());

            //save in MongoDB
            await SensorData.create({
                equipmentId: data.equipmentId,
                timestamp: data.timestamp,
                readings: data.readings,
                location: data.location
            });
            //check for alerting
            await checkAndAlert(data);
            channel.ack(msg); // acknowledgement message
        }catch(err){
            console.error('Error processing sensor data: ', err);
            channel.nack(msg, false, true) // false: reject this message(not all). true: requeue
        }
    });

    channel.consume('alerts', (msg)=> {
        if(!msg) return;
        const alert: Alert = JSON.parse(msg.content.toString());
        console.log(`Alert processed: [${alert.severity}] ${alert.equipmentId} - ${alert.type}: ${alert.value.toFixed(1)}`);
        channel.ack(msg);
    })

    console.log('Consumers started, waiting for messages');
};