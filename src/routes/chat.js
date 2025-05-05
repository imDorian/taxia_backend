import { Router } from 'express';
import { getMessage, getWeather } from '../controllers/chat.js';

const router = Router();

router.get('/message', getMessage);
router.get('/weather', getWeather);

export { router as chatRoutes };
