import { Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { sseManager } from "./sseManager";
import { findCommentsPaginated } from "../comments/commentDao";

const INIT_LIMIT = 20;
const PAGE_LIMIT = 20;

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

    const { items, hasMore } = await findCommentsPaginated(null, INIT_LIMIT);
    const nextCursor =
      items.length > 0 ? items[items.length - 1].createdAt.toISOString() : null;

    const payload = {
      items: items.map(toNotification),
      hasMore,
      nextCursor,
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

export const getNotifications = async (req: Request, res: Response) => {
  const cursor =
    typeof req.query.cursor === "string" ? req.query.cursor : null;

  try {
    const { items, hasMore } = await findCommentsPaginated(cursor, PAGE_LIMIT);
    const nextCursor =
      items.length > 0 ? items[items.length - 1].createdAt.toISOString() : null;
    res.json({ items: items.map(toNotification), hasMore, nextCursor });
  } catch {
    res.status(500).json({ message: "서버 오류" });
  }
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
