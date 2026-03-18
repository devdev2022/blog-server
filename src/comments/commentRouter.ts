import { Router } from "express";
import * as commentController from "./commentController";
import { optionalAuth } from "../utils/tokenValidation";

const router = Router();

// 포스트 댓글 목록 조회
router.get("/:postId", commentController.getComments);

// 댓글 작성 (로그인 유저는 github_id 저장)
router.post("/:postId", optionalAuth, commentController.createComment);

// 비밀번호 확인
router.post("/:id/verify-password", commentController.verifyPassword);

// 댓글 수정 (로그인한 오너는 비밀번호 없이 수정 가능)
router.patch("/:id", optionalAuth, commentController.editComment);

// 댓글 삭제 (로그인한 오너는 비밀번호 없이 삭제 가능)
router.delete("/:id", optionalAuth, commentController.deleteComment);

export default router;
