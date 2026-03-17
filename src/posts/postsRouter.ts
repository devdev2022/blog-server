import { Router } from "express";
import * as postsController from "./postsController";

const router = Router();

// 카테고리 목록 조회
router.get("/categories", postsController.getCategoryList);

// 태그 목록 조회
router.get("/tags", postsController.getTagList);

// 포스트 목록 조회 (페이지네이션, 카테고리/태그 필터링)
router.get("/", postsController.getPostList);

export default router;
