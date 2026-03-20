import { Request, Response } from "express";
import * as postsService from "./postsService";
import { catchAsync } from "../utils/error";

export const getPostList = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 6, 50);
  const mainCategory = req.query.mainCategory as string | undefined;
  const subCategory = req.query.subCategory as string | undefined;
  const tag = req.query.tag as string | undefined;

  const result = await postsService.getPostList({
    page,
    limit,
    mainCategory,
    subCategory,
    tag,
  });

  res.status(200).json(result);
});

export const getCategoryList = catchAsync(
  async (req: Request, res: Response) => {
    const result = await postsService.getCategoryList();
    res.status(200).json(result);
  },
);

export const getTagList = catchAsync(async (req: Request, res: Response) => {
  const result = await postsService.getTagList();
  res.status(200).json(result);
});

export const updatePost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, categorySlug, tags } = req.body;

  if (!title || !content) {
    res.status(400).json({ message: "제목과 내용은 필수입니다." });
    return;
  }

  if (title.length > 200) {
    res.status(400).json({ message: "제목은 200자 이내여야 합니다." });
    return;
  }

  if (content.length > 100000) {
    res.status(400).json({ message: "본문은 100,000자 이내여야 합니다." });
    return;
  }

  const tagList: string[] = Array.isArray(tags) ? tags : [];
  const result = await postsService.updatePost(id, { title, content, categorySlug, tags: tagList });
  if (!result) {
    res.status(404).json({ message: "포스트를 찾을 수 없습니다." });
    return;
  }

  res.status(200).json({ message: "포스트가 수정되었습니다." });
});

export const createPost = catchAsync(async (req: Request, res: Response) => {
  const { title, content, categorySlug, tags } = req.body;

  if (!title || !content) {
    res.status(400).json({ message: "제목과 내용은 필수입니다." });
    return;
  }

  if (title.length > 200) {
    res.status(400).json({ message: "제목은 200자 이내여야 합니다." });
    return;
  }

  if (content.length > 100000) {
    res.status(400).json({ message: "본문은 100,000자 이내여야 합니다." });
    return;
  }

  const tagList: string[] = Array.isArray(tags) ? tags : [];
  const result = await postsService.createPost(req.userId!, {
    title,
    content,
    categorySlug,
    tags: tagList,
  });
  res.status(201).json(result);
});

export const createDraft = catchAsync(async (req: Request, res: Response) => {
  const { title, content, categorySlug, tags } = req.body;

  if (!title || !content) {
    res.status(400).json({ message: "제목과 내용은 필수입니다." });
    return;
  }

  if (title.length > 200) {
    res.status(400).json({ message: "제목은 200자 이내여야 합니다." });
    return;
  }

  if (content.length > 100000) {
    res.status(400).json({ message: "본문은 100,000자 이내여야 합니다." });
    return;
  }

  const tagList: string[] = Array.isArray(tags) ? tags : [];
  const result = await postsService.createDraft(req.userId!, {
    title,
    content,
    categorySlug,
    tags: tagList,
  });
  res.status(201).json(result);
});

export const updateDraft = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, content, categorySlug, tags } = req.body;

  if (!title || !content) {
    res.status(400).json({ message: "제목과 내용은 필수입니다." });
    return;
  }

  if (title.length > 200) {
    res.status(400).json({ message: "제목은 200자 이내여야 합니다." });
    return;
  }

  if (content.length > 100000) {
    res.status(400).json({ message: "본문은 100,000자 이내여야 합니다." });
    return;
  }

  const tagList: string[] = Array.isArray(tags) ? tags : [];
  const result = await postsService.updateDraft(id, {
    title,
    content,
    categorySlug,
    tags: tagList,
  });

  if (!result) {
    res.status(404).json({ message: "임시저장을 찾을 수 없습니다." });
    return;
  }

  res.status(200).json({ message: "임시저장이 수정되었습니다." });
});

export const getPostById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await postsService.getPostById(id);
  if (!result) {
    res.status(404).json({ message: "포스트를 찾을 수 없습니다." });
    return;
  }
  res.status(200).json(result);
});
