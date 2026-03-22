import mongoose, {Schema, Document} from 'mongoose';

export interface ISensorReading{
    type: string;
    value: number;
    unit: string;
}

export interface ISensorData extends Document{
    equipmentId: string;
    timestamp: Date;
    readings: ISensorReading[];
    location: string;
}

const sensorReadingSchema = new Schema<ISensorReading>({
    type: {type: String, required: true},
    value: {type: Number, required: true},
    unit: {type: String, required: true}
}, {_id:false});

const sensorDataSchema = new Schema<ISensorData>({
    equipmentId: {type: String, required: true, index: true},
    timestamp: {type: Date, required: true, default: Date.now},
    readings: {type: [sensorReadingSchema], required: true},
    location: {type: String, required: true}
});

sensorDataSchema.index({equipment: 1, timestamp: -1});

sensorDataSchema.index({timestamp: 1}, {expireAfterSeconds: 60 * 60 * 24 * 90});

export default mongoose.model<ISensorData>('SensorData', sensorDataSchema);