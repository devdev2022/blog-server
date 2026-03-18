import { Request, Response } from "express";
import * as mainService from "./mainService";
import { catchAsync } from "../utils/error";

export const getRecentPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await mainService.getRecentPosts();
  res.status(200).json(result);
});

export const getTechStacks = catchAsync(async (req: Request, res: Response) => {
  const result = await mainService.getTechStacks();
  res.status(200).json(result);
});
