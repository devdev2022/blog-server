import { Request, Response } from "express";
import * as authService from "./authService";
import { catchAsync, customError } from "../utils/error";

export const redirectToGithub = (req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: process.env.GITHUB_REDIRECT_URI!,
    scope: "read:user",
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
};

export const githubCallback = catchAsync(
  async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
      customError("Authorization code required", 400);
    }

    const { refreshToken, isNewUser } = await authService.githubLogin(
      code as string,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14일
      path: "/",
    });

    // 신규 여부만 URL로 전달
    const params = new URLSearchParams({
      isNewUser: String(isNewUser),
    });

    res.redirect(`${process.env.CLIENT_URL}/auth/callback?${params}`);
  },
);

export const refreshAccessToken = catchAsync(
  async (req: Request, res: Response) => {
    const { accessToken, user } = await authService.reissueAccessToken(
      req.userId!,
    );
    res.status(200).json({
      accessToken,
      user: { github_id: Number(user.github_id), username: user.username, profile_avatar: user.profileAvatar, blog_nickname: user.blogNickname ?? null },
    });
  },
);

export const logOut = catchAsync(async (req: Request, res: Response) => {
  await authService.logOut(req.userId!);
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.status(204).send();
});
