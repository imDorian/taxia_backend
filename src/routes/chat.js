import { Router } from "express";
import { getMessage, getWeather, getChat } from "../controllers/chat.js";

const router = Router();

router.get("/message", getMessage);
router.get("/weather", getWeather);
router.get("/get-chat", getChat);
// router.get("/chat", getWeather);

export { router as chatRoutes };
