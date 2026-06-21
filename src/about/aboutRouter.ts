import { Router } from "express";
import * as aboutController from "./aboutController";

const router = Router();

// 프로필 조회
router.get("/profile", aboutController.getProfile);

// 경력 목록 조회
router.get("/work-experiences", aboutController.getWorkExperiences);

// 사이드 프로젝트 목록 조회
router.get("/side-projects", aboutController.getSideProjects);

// 기술 스택 목록 조회
router.get("/tech-stacks", aboutController.getTechStacks);

export default router;
