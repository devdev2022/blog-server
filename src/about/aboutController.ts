import { Request, Response } from "express";
import * as aboutService from "./aboutService";
import { catchAsync, customError } from "../utils/error";

export const updateBio = catchAsync(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { bio } = req.body as { bio: string };
  await aboutService.updateBio(userId, bio);
  res.status(200).json({ message: "bio가 업데이트되었습니다." });
});

export const updateAvatar = catchAsync(async (req: Request, res: Response) => {
  const userId = req.userId!;
  if (!req.file) customError("파일이 없습니다.", 400);
  const avatarUrl = `/uploads/${req.file!.filename}`;
  await aboutService.updateAvatar(userId, avatarUrl);
  res.status(200).json({ bio_avatar: avatarUrl });
});

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await aboutService.getProfile();
  res.status(200).json(result);
});

export const getWorkExperiences = catchAsync(
  async (req: Request, res: Response) => {
    const result = await aboutService.getWorkExperiences();
    res.status(200).json(result);
  },
);

export const getSideProjects = catchAsync(
  async (req: Request, res: Response) => {
    const result = await aboutService.getSideProjects();
    res.status(200).json(result);
  },
);

export const getTechStacks = catchAsync(
  async (req: Request, res: Response) => {
    const result = await aboutService.getTechStacks();
    res.status(200).json(result);
  },
);
