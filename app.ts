import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRouter from "./src/auth/authRouter";
import { globalErrorHandler } from "./src/utils/error";

const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://127.0.0.1:3001",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());
  app.use(morgan("combined"));
  app.use(cookieParser());

  app.use("/auth", authRouter);

  app.use(globalErrorHandler);

  return app;
};

export { createApp };
