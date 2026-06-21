import { Router } from "express";
import * as usersController from "./usersController";
import { validateAccessToken } from "../utils/tokenValidation";
import { imageUpload } from "../utils/upload";

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

// 프로필 아바타 업로드
router.patch("/me/avatar", validateAccessToken, (req, _res, next) => {
  (req as any).query.folder = "profile";
  next();
}, imageUpload.single("avatar"), usersController.updateMyAvatar);

// 회원 탈퇴
router.delete("/me", validateAccessToken, usersController.deleteMyAccount);

export default router;
