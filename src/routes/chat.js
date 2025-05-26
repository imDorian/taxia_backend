import { Router } from "express";
import { getWeather, getChat } from "../controllers/chat.js";
import { isValidToken } from "../middlewares/isValidToken.js";

const router = Router();

router.get("/weather", getWeather);
router.get("/get-chat/", [isValidToken], getChat);
// router.get("/chat", getWeather);

export { router as chatRoutes };
