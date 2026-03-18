import { Request, Response } from "express";
import * as commentService from "./commentService";
import { catchAsync } from "../utils/error";

export const getComments = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const result = await commentService.getComments(postId);
  res.status(200).json(result);
});

export const createComment = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { parentId, nickname, password, content, avatarUrl } = req.body;

  if (!nickname?.trim() || !password?.trim() || !content?.trim()) {
    res.status(400).json({ message: "닉네임, 비밀번호, 내용은 필수입니다." });
    return;
  }

  const ipAddress =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ??
    req.socket.remoteAddress;

  if (!ipAddress) {
    res.status(400).json({ message: "IP를 확인할 수 없습니다." });
    return;
  }

  const result = await commentService.createComment({
    postId,
    parentId: parentId ?? null,
    nickname: nickname.trim(),
    password: password.trim(),
    content: content.trim(),
    avatarUrl: avatarUrl ?? null,
    githubId: req.userId ? Number(req.userId) : null,
    ipAddress,
  });
  res.status(201).json(result);
});

export const verifyPassword = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { password } = req.body;
    const ok = await commentService.verifyPassword(id, password);
    res.status(200).json({ ok });
  },
);

export const editComment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { password, content } = req.body;
  const githubId = req.userId ? Number(req.userId) : undefined;

  if (!content?.trim()) {
    res.status(400).json({ message: "내용은 필수입니다." });
    return;
  }

  if (!githubId && !password?.trim()) {
    res.status(400).json({ message: "비밀번호는 필수입니다." });
    return;
  }

  const ok = await commentService.editComment(id, content.trim(), password?.trim(), githubId);
  if (!ok) {
    res.status(403).json({ message: "비밀번호가 일치하지 않습니다." });
    return;
  }
  res.status(200).json({ message: "수정되었습니다." });
});

export const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { password } = req.body;
  const githubId = req.userId ? Number(req.userId) : undefined;

  const ok = await commentService.removeComment(id, password, githubId);
  if (!ok) {
    res.status(403).json({ message: "비밀번호가 일치하지 않습니다." });
    return;
  }
  res.status(200).json({ message: "삭제되었습니다." });
});
