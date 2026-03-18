import { Router } from "express";
import * as aboutController from "./aboutController";
import { validateAccessToken } from "../utils/tokenValidation";
import { avatarUpload } from "../utils/upload";

const router = Router();

// 프로필 조회
router.get("/profile", aboutController.getProfile);

// bio 수정 (인증 필요)
router.patch("/profile/bio", validateAccessToken, aboutController.updateBio);

// 아바타 업로드 (인증 필요)
router.patch("/profile/avatar", validateAccessToken, avatarUpload.single("avatar"), aboutController.updateAvatar);

// 경력 목록 조회
router.get("/work-experiences", aboutController.getWorkExperiences);

// 사이드 프로젝트 목록 조회
router.get("/side-projects", aboutController.getSideProjects);

// 기술 스택 목록 조회
router.get("/tech-stacks", aboutController.getTechStacks);

export default router;
