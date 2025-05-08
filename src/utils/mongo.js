import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_DB;

async function run() {
    try {
        const DB = await mongoose.connect(uri)
        const { name, host } = DB.connection
        console.log(`Connected to DB: ${name}, in host ${host}`)
    } catch (error) {
        console.error("Error connecting to DB", error)
    }
}

export default run;
