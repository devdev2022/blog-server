import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { sseManager } from "./sseManager";
import { findCommentsSince } from "../comments/commentDao";

const toNotification = (comment: any) => ({
  id: comment.id.replaceAll("-", ""),
  postId: comment.postId.replaceAll("-", ""),
  parentId: comment.parentId ? comment.parentId.replaceAll("-", "") : null,
  nickname: comment.nickname,
  content: comment.content,
  createdAt: comment.createdAt,
});

export const streamNotifications = async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const [row] = await AppDataSource.query(
      `SELECT notification_read_at FROM users WHERE id = $1`,
      [req.userId],
    );
    const readAt: Date | null = row?.notification_read_at ?? null;

    // 목록 표시 범위: readAt 기준 7일 전 (readAt이 없으면 현재 기준 7일 전)
    const base = readAt ?? new Date();
    const windowStart = new Date(base.getTime() - 7 * 24 * 60 * 60 * 1000);

    const existing = await findCommentsSince(windowStart);
    const payload = {
      items: existing.map(toNotification),
      readAt: readAt ? readAt.toISOString() : null,
    };
    res.write(`event: init\ndata: ${JSON.stringify(payload)}\n\n`);
  } catch (err) {
    res.end();
    return;
  }

  sseManager.addClient(res);

  req.on("close", () => {
    sseManager.removeClient(res);
  });
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    await AppDataSource.query(
      `UPDATE users SET notification_read_at = NOW() WHERE id = $1`,
      [req.userId],
    );
    res.status(200).json({ message: "읽음 처리 완료" });
  } catch (err) {
    res.status(500).json({ message: "서버 오류" });
  }
};
