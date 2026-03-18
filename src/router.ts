import { Router } from "express";
import authRouter from "./auth/authRouter";
import postsRouter from "./posts/postsRouter";
import aboutRouter from "./about/aboutRouter";
import mainRouter from "./main/mainRouter";
import commentRouter from "./comments/commentRouter";

const router = Router();

router.use("/auth", authRouter);
router.use("/posts", postsRouter);
router.use("/about", aboutRouter);
router.use("/main", mainRouter);
router.use("/comments", commentRouter);

export default router;
