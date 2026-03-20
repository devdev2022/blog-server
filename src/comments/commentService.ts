import bcrypt from "bcrypt";
import * as commentDao from "./commentDao";

const BLOG_OWNER_GITHUB_ID = Number(process.env.BLOG_OWNER_GITHUB_ID);

const SALT_ROUNDS = 10;

const toResponse = (comment: any) => ({
  id: comment.id.replaceAll("-", ""),
  parentId: comment.parentId ? comment.parentId.replaceAll("-", "") : null,
  nickname: comment.nickname,
  avatarUrl: comment.avatarUrl ?? null,
  content: comment.content,
  createdAt: comment.createdAt,
  editedAt: comment.editedAt ?? null,
  isOwnerComment: (!!comment.githubId && Number(comment.githubId) === BLOG_OWNER_GITHUB_ID) || !!comment.avatarUrl,
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
  githubId: number | null;
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
  githubId?: number,
): Promise<boolean> => {
  const comment = await commentDao.findById(id);
  if (!comment) return false;

  const isOwner = githubId === BLOG_OWNER_GITHUB_ID;
  if (isOwner || (githubId && Number(comment.githubId) === githubId)) {
    // 블로그 오너이거나 본인 댓글: 비밀번호 없이 수정 가능
  } else {
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
  githubId?: number,
): Promise<boolean> => {
  const comment = await commentDao.findById(id);
  if (!comment) return false;

  const isOwner = githubId === BLOG_OWNER_GITHUB_ID;
  if (isOwner || (githubId && Number(comment.githubId) === githubId)) {
    // 블로그 오너이거나 본인 댓글: 비밀번호 없이 삭제 가능
  } else {
    if (!password) return false;
    const ok = await verifyPassword(id, password);
    if (!ok) return false;
  }

  await commentDao.deleteComment(id);
  return true;
};
