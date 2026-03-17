import { Request, Response } from "express";
import * as postsService from "./postsService";
import { catchAsync } from "../utils/error";

export const getPostList = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 6;
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
