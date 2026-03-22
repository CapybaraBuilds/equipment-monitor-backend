import mongoose from 'mongoose';
import SensorData from '../models/mongo/SensorData';
import dotenv from 'dotenv';

dotenv.config();

const benchmark = async () => {
    await mongoose.connect(process.env.MONGODB_URI!);

    //Delete the compound index. Simulate situation without index
    await SensorData.collection.dropIndex('equipmentId_1_timestamp_-1').catch(()=>{}); // Ignore error if the index does not exist

    const startWithout = Date.now();
    await SensorData.find({equipmentId: 'EQ-001'}).sort({timestamp: -1}).limit(100);
    const timeWithout = Date.now() - startWithout;
    console.log(`Without index: ${timeWithout}ms`);

    // create index again
    await SensorData.collection.createIndex({equipmentId: 1, timestamp: -1});

    const startWith = Date.now();
    await SensorData.find({equipmentId: 'EQ-001'}).sort({timestamp: -1}).limit(100);
    const timeWith = Date.now() - startWith;
    console.log(`With index: ${timeWith}ms`);

    const improvement = ((timeWithout - timeWith) / timeWithout * 100).toFixed(0);
    console.log(`Performance improvement: ${improvement}%`);

    await mongoose.disconnect();
}

benchmark();