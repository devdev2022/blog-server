import { AppDataSource } from "../../data-source";
import { Post } from "../../entity/Posts";
import { TechStack } from "../../entity/TechStack";

export const findRecentPosts = async () => {
  return AppDataSource.getRepository(Post)
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.mainCategory", "mainCategory")
    .leftJoinAndSelect("post.subCategory", "subCategory")
    .leftJoinAndSelect("post.tags", "tags")
    .leftJoinAndSelect("post.media", "media")
    .where("post.isSuspended = :isSuspended", { isSuspended: false })
    .orderBy("post.createdAt", "DESC")
    .addOrderBy("media.order", "ASC")
    .take(3)
    .getMany();
};

export const findTechStacks = async () => {
  return AppDataSource.getRepository(TechStack)
    .createQueryBuilder("techStack")
    .leftJoinAndSelect("techStack.category", "category")
    .orderBy("techStack.name", "ASC")
    .getMany();
};
