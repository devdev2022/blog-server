import bcrypt from "bcrypt";
import * as commentDao from "./commentDao";

const SALT_ROUNDS = 10;

const toResponse = (comment: any) => ({
  id: comment.id.replaceAll("-", ""),
  parentId: comment.parentId ? comment.parentId.replaceAll("-", "") : null,
  nickname: comment.nickname,
  avatarUrl: comment.avatarUrl ?? null,
  content: comment.content,
  createdAt: comment.createdAt,
  editedAt: comment.editedAt ?? null,
});

export const getComments = async (postId: string) => {
  const comments = await commentDao.findByPostId(postId);
  return comments.map(toResponse);
};

export const createComment = async (data: {
  postId: string;
  parentId: string | null;
  nickname: string;
  password: string;
  content: string;
  avatarUrl: string | null;
  ipAddress: string | null;
}) => {
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  const comment = await commentDao.createComment({
    ...data,
    password: hashedPassword,
  });
  return toResponse(comment);
};

export const verifyPassword = async (
  id: string,
  password: string,
): Promise<boolean> => {
  const comment = await commentDao.findById(id);
  if (!comment) return false;
  return bcrypt.compare(password, comment.password);
};

export const editComment = async (
  id: string,
  content: string,
  password?: string,
  isOwner = false,
): Promise<boolean> => {
  if (!isOwner) {
    if (!password) return false;
    const ok = await verifyPassword(id, password);
    if (!ok) return false;
  }
  await commentDao.updateComment(id, content);
  return true;
};

export const removeComment = async (
  id: string,
  password?: string,
  isOwner = false,
): Promise<boolean> => {
  if (!isOwner) {
    if (!password) return false;
    const ok = await verifyPassword(id, password);
    if (!ok) return false;
  }
  await commentDao.deleteComment(id);
  return true;
};
