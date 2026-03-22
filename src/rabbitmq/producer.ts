import { getRabbitMQChannel } from "./connection";
// interface used by rabbitmq
export interface SensorMessage {
    equipmentId: string;
    timestamp: string;
    readings: Array<{
        type: string;
        value: number;
        unit: string;
    }>;
    location: string
}

export const publishSensorData = async (data: SensorMessage): Promise<void> => {
    const channel = await getRabbitMQChannel();
    channel.sendToQueue(
        'sensor_data', 
        Buffer.from(JSON.stringify(data)),
        {persistent: true} // messages persist after rabbitMQ restarting
    );
};
// Simulate sensor: one request each second (for development tests)
export const startSensorSimulator = async(): Promise<void> => {
    console.log('Sensor simulator started, publishing data every second...');
    const equipments = ['EQ-001', 'EQ-002', 'EQ-003'];

    setInterval(async () => {
        for (const equipmentId of equipments ) {
            const message: SensorMessage = {
                equipmentId,
                timestamp: new Date().toISOString(),
                readings:[
                    {type: 'temperature', value: 60 + Math.random() * 40, unit:  '°C'},
                    {type: 'pressure', value: 1 + Math.random() * 4, unit:  'bar'},
                    {type: 'rpm', value: 1000 + Math.random() * 500, unit:  'rpm'}
                ],
                location: 'Factory Floor A'
            };
            await publishSensorData(message);
        };
    }, 1000); // 1 message per second for each equipment
};