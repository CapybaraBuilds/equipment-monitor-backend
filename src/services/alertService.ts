import {SensorMessage} from '../rabbitmq/producer';
import { getRabbitMQChannel } from '../rabbitmq/connection';

// alert configuration configuration
const THRESHOLDS = {
    temperature: {warning: 80, critical: 90}, // celcius
    pressure: {warning: 3.5, critical: 4.5} // bar
}

export interface Alert {
    equipmentId: string;
    type: string; // temperature or pressure
    severity: 'WARNING' | 'CRITICAL';
    value: number;
    threshold: number;
    timestamp: string; // used for rabbitMQ
    message: string;
}

export const checkAndAlert = async(data: SensorMessage) : Promise<void> => {
    const channel = await getRabbitMQChannel();
    const alerts : Alert[] = [];

    for(const reading of data.readings){
        const threshold = THRESHOLDS[reading.type as keyof typeof THRESHOLDS]; // avoid type checking
        if(!threshold) continue;

        if(reading.value >= threshold.critical) {
            alerts.push({
                equipmentId: data.equipmentId,
                type: reading.type,
                severity: 'CRITICAL',
                value: reading.value,
                threshold: threshold.critical,
                timestamp: data.timestamp,
                message: `CRITICAL: ${data.equipmentId} ${reading.type} is ${reading.value.toFixed(1)}${reading.unit}, exceeds critical threshold ${threshold.critical}!`
            });
        }else if(reading.value >= threshold.warning){
            alerts.push({
                equipmentId: data.equipmentId,
                type: reading.type,
                severity: 'WARNING',
                value: reading.value,
                threshold: threshold.warning,
                timestamp: data.timestamp,
                message: `WARNING: ${data.equipmentId} ${reading.type} is ${reading.value.toFixed(1)}${reading.unit}, exceeds warning threshold ${threshold.warning}!`
            });
        }
    }

    for (const alert of alerts){
        channel.sendToQueue('alerts', Buffer.from(JSON.stringify(alert)), {persistent: true});
        console.log(`Alert sent: ${alert.message}`);
    }
}