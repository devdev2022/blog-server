import { Router } from "express";
import * as postsController from "./postsController";
import { validateAccessToken } from "../utils/tokenValidation";

const router = Router();

// 카테고리 목록 조회
router.get("/categories", postsController.getCategoryList);

// 태그 목록 조회
router.get("/tags", postsController.getTagList);

// 임시저장 생성
router.post("/drafts", validateAccessToken, postsController.createDraft);

// 임시저장 수정
router.put("/drafts/:id", validateAccessToken, postsController.updateDraft);

// 포스트 작성
router.post("/", validateAccessToken, postsController.createPost);

// 포스트 목록 조회 (페이지네이션, 카테고리/태그 필터링)
router.get("/", postsController.getPostList);

// 포스트 상세 조회
router.get("/:id", postsController.getPostById);

// 포스트 수정
router.put("/:id", postsController.updatePost);

export default router;
