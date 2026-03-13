import { Router } from "express";
import * as authController from "./authController";
import {
  validateAccessToken,
  validateTokens,
} from "../utils/tokenValidation";

const router = Router();

// GitHub OAuth 시작 - GitHub 로그인 페이지로 리다이렉트
router.get("/github", authController.redirectToGithub);

// GitHub OAuth 콜백 - code를 받아 JWT 발급
router.get("/github/callback", authController.githubCallback);

// Access Token 재발급 (Access Token 만료 시, Refresh Token으로 재발급)
router.post("/token/refresh", validateTokens, authController.refreshAccessToken);

// 로그아웃
router.delete("/logout", validateAccessToken, authController.logOut);

export default router;
