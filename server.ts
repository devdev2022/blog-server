import dotenv from "dotenv";
const env = process.env.NODE_ENV || "local";
dotenv.config({ path: `.env.${env}` });

import { createApp } from "./app";
import { AppDataSource } from "./data-source";

const startServer = async () => {
  const app = createApp();
  const PORT = process.env.PORT;

  try {
    const conn = await AppDataSource.initialize();
    if (conn) {
      console.log("Data Source has been initialized!!!");
    }
  } catch (error) {
    console.log("Error occured during Data Source initialization", error);
    process.exit(1);
  }

  app.get("/ping", (req, res) => {
    res.json({ message: "pong" });
  });

  const server = app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use.`);
    } else {
      console.error("Server error:", err);
    }
    process.exit(1);
  });

  const shutdown = async () => {
    server.close(async () => {
      await AppDataSource.destroy();
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

startServer();
