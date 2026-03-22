import ampq, {ChannelModel, Channel} from 'amqplib';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export const getRabbitMQChannel = async (): Promise<Channel> => {
    if(channel) return channel;

    connection = await ampq.connect(process.env.RABBITMQ_URI!);
    channel = await connection.createChannel();

    await channel.assertQueue('sensor_data', {durable: true});
    await channel.assertQueue('alerts', {durable: true});

    console.log('RabbitMQ connected, queues ready!');
    return channel
}

export const closeRabbitMQ = async (): Promise<void> => {
    if(channel) await channel.close();
    if(connection) await connection.close()
};