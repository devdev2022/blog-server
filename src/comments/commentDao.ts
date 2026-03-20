import { AppDataSource } from "../../data-source";
import { Comment } from "../../entity/Comment";

export const findByPostId = async (postId: string) => {
  return AppDataSource.getRepository(Comment)
    .createQueryBuilder("comment")
    .where("comment.post_id = UNHEX(REPLACE(:postId, '-', ''))", { postId })
    .orderBy("comment.createdAt", "ASC")
    .getMany();
};

export const findById = async (id: string) => {
  return AppDataSource.getRepository(Comment)
    .createQueryBuilder("comment")
    .where("comment.id = UNHEX(REPLACE(:id, '-', ''))", { id })
    .getOne();
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
  const repo = AppDataSource.getRepository(Comment);
  const comment = repo.create({
    postId: data.postId,
    parentId: data.parentId,
    nickname: data.nickname,
    password: data.password,
    content: data.content,
    avatarUrl: data.avatarUrl,
    githubId: data.githubId,
    ipAddress: data.ipAddress,
  });
  return repo.save(comment);
};

export const updateComment = async (
  id: string,
  content: string,
) => {
  await AppDataSource.getRepository(Comment)
    .createQueryBuilder()
    .update(Comment)
    .set({ content, editedAt: new Date() })
    .where("id = UNHEX(REPLACE(:id, '-', ''))", { id })
    .execute();
};

export const findCommentsSince = async (since: Date | null) => {
  const qb = AppDataSource.getRepository(Comment)
    .createQueryBuilder("comment")
    .where("comment.githubId IS NULL")
    .orderBy("comment.createdAt", "DESC");

  if (since) {
    qb.andWhere("comment.createdAt > :since", { since });
  }

  return qb.getMany();
};

export const deleteComment = async (id: string) => {
  await AppDataSource.getRepository(Comment)
    .createQueryBuilder()
    .delete()
    .from(Comment)
    .where("id = UNHEX(REPLACE(:id, '-', ''))", { id })
    .execute();
};
