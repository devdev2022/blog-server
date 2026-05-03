import { Router } from "express";
import { validateAccessToken } from "../utils/tokenValidation";
import * as notificationController from "./notificationController";

const router = Router();

// 알림 목록 페이지네이션 조회 (오너만)
router.get("/", validateAccessToken, notificationController.getNotifications);

// SSE 스트림 연결 (오너만)
router.get("/stream", validateAccessToken, notificationController.streamNotifications);

// 알림 읽음 처리 (오너만)
router.patch("/read", validateAccessToken, notificationController.markAsRead);

export default router;
