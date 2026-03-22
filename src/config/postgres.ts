import {Sequelize} from 'sequelize';
import dotenv from 'dotenv';
dotenv.config()

const sequelize = new Sequelize(
    process.env.PG_DATABASE!,
    process.env.PG_USER!,
    process.env.PG_PASSWORD!,
    {
        host: process.env.PG_HOST,
        port: Number(process.env.PG_Port),
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 10,
            min: 10,
            acquire: 30000,
            idle: 10000
        }
    }
)

export const connectPostgres = async (): Promise<void> => {
    try{
        await sequelize.authenticate();
        console.log("PostgreSQL connected successfully!");
    }catch(err){
        console.error('PostgreSQL connection failed: ', err);
        process.exit(1);
    }
};

export default sequelize;