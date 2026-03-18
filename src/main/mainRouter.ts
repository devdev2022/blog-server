import { Router } from "express";
import * as mainController from "./mainController";

const router = Router();

// 최근 포스트 3개 조회
router.get("/recent-posts", mainController.getRecentPosts);

// 기술 스택 목록 조회
router.get("/tech-stacks", mainController.getTechStacks);

export default router;
