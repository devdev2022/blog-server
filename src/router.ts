import { Router } from "express";
import authRouter from "./auth/authRouter";
import postsRouter from "./posts/postsRouter";
import aboutRouter from "./about/aboutRouter";

const router = Router();

router.use("/auth", authRouter);
router.use("/posts", postsRouter);
router.use("/about", aboutRouter);

export default router;
