import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { chatRoutes } from "./routes/chat.js";
import run from "./utils/mongo.js";
import { billingRouter } from "./routes/billing.js";
import { userRoutes } from "./routes/user.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.use('/api/users',);

app.use("/chat", chatRoutes);
app.use("/billing", billingRouter);
app.use("/user", userRoutes);
app.get("/ping", (req, res) => {
  res.send("pong");
});

run();
export default app;
