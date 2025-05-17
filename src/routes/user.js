import { Router } from "express";
import { createUser, getUser, getUsers } from "../controllers/user.js";

const router = Router();

router.get("/get-users", getUsers);
router.get("/get-user", getUser);
router.post("/create-user", createUser);

export { router as userRoutes };
