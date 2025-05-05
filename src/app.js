import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { chatRoutes } from './routes/chat.js';


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/api/users',);

app.use('/chat', chatRoutes);


export default app;
