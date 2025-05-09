import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { chatRoutes } from './routes/chat.js';
import { io } from './server.js';
import run from './utils/mongo.js';
import { billingRouter } from './routes/billing.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/api/users',);

app.use('/chat', (req, res, next) => {
    req.io = io;
    next();
}, chatRoutes);

app.use('/billing', billingRouter);

run();
export default app;
