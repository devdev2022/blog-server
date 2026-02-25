import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// import { router } from "./src/forrest/routes";
// import { globalErrorHandler } from "./src/forrest/utils/error";

const createApp = () => {
  const app = express();

  app.use(express.static("src/utils/swagger"));

  app.use(cookieParser());

  //   app.use(
  //     cors({
  //       origin: ["http://127.0.0.1:3001", "http://localhost:3001"],
  //       credentials: true,
  //       methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  //       allowedHeaders: ["Content-Type", "Authorization"],
  //     }),
  //   );
  //   app.use(express.json());
  //   app.use(morgan("combined"));

  //   app.use(router);
  //   app.use(globalErrorHandler);

  return app;
};

export { createApp };
