import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import router from "./src/router";
import { globalErrorHandler } from "./src/utils/error";

const createApp = () => {
  const app = express();

  const allowedOrigins = [
    process.env.PROD_CLIENT_URL,
    process.env.STG_CLIENT_URL,
    process.env.LOCAL_CLIENT_URL,
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  app.use(express.json());
  app.use(morgan("combined"));
  app.use(cookieParser());

  app.use(router);

  app.use(globalErrorHandler);

  return app;
};

export { createApp };
