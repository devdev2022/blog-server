import { Request, Response } from "express";
import * as usersService from "./usersService";
import { catchAsync, customError } from "../utils/error";

export const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const profile = await usersService.getMyProfile(req.userId!);
  res.status(200).json(profile);
});

export const checkBlogNickname = catchAsync(
  async (req: Request, res: Response) => {
    const { value } = req.query;
    if (!value || typeof value !== "string") {
      customError("value 파라미터가 필요합니다.", 400);
    }
    const result = await usersService.checkBlogNicknameAvailability(
      value as string,
      req.userId!
    );
    res.status(200).json(result);
  }
);

export const updateMyProfile = catchAsync(
  async (req: Request, res: Response) => {
    const { nickname, blog_nickname, bio, profile_avatar } = req.body;
    await usersService.updateMyProfile(req.userId!, {
      nickname,
      blog_nickname: blog_nickname ?? null,
      bio: bio ?? null,
      profile_avatar: profile_avatar ?? null,
    });
    res.status(200).json({ message: "프로필이 저장되었습니다." });
  }
);

export const deleteMyAccount = catchAsync(
  async (req: Request, res: Response) => {
    await usersService.deleteMyAccount(req.userId!);
    const isRemote = process.env.NODE_ENV !== "local";
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isRemote,
      sameSite: isRemote ? "none" : "lax",
      path: "/",
    });
    res.status(204).send();
  }
);
