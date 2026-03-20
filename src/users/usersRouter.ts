import { Router } from "express";
import * as usersController from "./usersController";
import { validateAccessToken } from "../utils/tokenValidation";

const router = Router();

// 내 프로필 조회
router.get("/me", validateAccessToken, usersController.getMyProfile);

// 블로그 닉네임 중복 확인
router.get(
  "/blog-nickname/check",
  validateAccessToken,
  usersController.checkBlogNickname
);

// 내 프로필 수정
router.patch("/me", validateAccessToken, usersController.updateMyProfile);

// 회원 탈퇴
router.delete("/me", validateAccessToken, usersController.deleteMyAccount);

export default router;
