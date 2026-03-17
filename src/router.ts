import { Router } from "express";
import authRouter from "./auth/authRouter";
import postsRouter from "./posts/postsRouter";

const router = Router();

router.use("/auth", authRouter);
router.use("/posts", postsRouter);

export default router;
