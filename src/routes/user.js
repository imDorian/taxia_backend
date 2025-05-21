import { Router } from "express";
import { getUser, getUsers, login, register } from "../controllers/user.js";
import { isValidToken } from "../middlewares/isValidToken.js";

const router = Router();

router.get("/get-users", getUsers);
router.get("/get-user", [isValidToken], getUser);
router.post("/login", login);
router.post("/register", register);
router.post("/istoken", isValidToken);

export { router as userRoutes };
