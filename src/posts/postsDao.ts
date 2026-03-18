import { AppDataSource } from "../../data-source";
import { Post } from "../../entity/Posts";
import { MainCategory } from "../../entity/MainCategory";
import { Tag } from "../../entity/Tag";

interface FindPostsParams {
  page: number;
  limit: number;
  mainCategory?: string;
  subCategory?: string;
  tag?: string;
}

export const findPosts = async (params: FindPostsParams) => {
  const { page, limit, mainCategory, subCategory, tag } = params;

  const qb = AppDataSource.getRepository(Post)
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.mainCategory", "mainCategory")
    .leftJoinAndSelect("post.subCategory", "subCategory")
    .leftJoinAndSelect("post.tags", "tags")
    .leftJoinAndSelect("post.media", "media")
    .where("post.isSuspended = :isSuspended", { isSuspended: false })
    .orderBy("post.createdAt", "DESC")
    .addOrderBy("media.order", "ASC")
    .skip((page - 1) * limit)
    .take(limit);

  if (mainCategory) {
    qb.andWhere("mainCategory.name = :mainCategory", { mainCategory });
  }

  if (subCategory) {
    qb.andWhere("subCategory.name = :subCategory", { subCategory });
  }

  if (tag) {
    qb.andWhere(
      `EXISTS (
        SELECT 1 FROM post_tags pt
        INNER JOIN tags t ON t.id = pt.tag_id
        WHERE pt.post_id = post.id AND t.name = :tag
      )`,
      { tag },
    );
  }

  const [posts, total] = await qb.getManyAndCount();
  return { posts, total };
};

export const findAllCategories = async () => {
  const categories = await AppDataSource.getRepository(MainCategory)
    .createQueryBuilder("mainCategory")
    .leftJoinAndSelect("mainCategory.subCategories", "subCategory")
    .getMany();

  for (const main of categories) {
    const [{ count: mainCount }] = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM posts
       WHERE main_category_id = UNHEX(REPLACE(?, '-', ''))
       AND sub_category_id IS NULL
       AND is_suspended = 0`,
      [main.id],
    );
    (main as any).postCount = parseInt(mainCount as string, 10);

    for (const sub of main.subCategories) {
      const [{ count }] = await AppDataSource.query(
        `SELECT COUNT(*) as count FROM posts
         WHERE sub_category_id = UNHEX(REPLACE(?, '-', ''))
         AND is_suspended = 0`,
        [sub.id],
      );
      (sub as any).postCount = parseInt(count as string, 10);
    }
  }

  return categories;
};

export const findPostById = async (id: string) => {
  return AppDataSource.getRepository(Post)
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.mainCategory", "mainCategory")
    .leftJoinAndSelect("post.subCategory", "subCategory")
    .leftJoinAndSelect("post.tags", "tags")
    .leftJoinAndSelect("post.media", "media")
    .where("post.id = UNHEX(REPLACE(:id, '-', ''))", { id })
    .andWhere("post.isSuspended = :isSuspended", { isSuspended: false })
    .addOrderBy("media.order", "ASC")
    .getOne();
};

export const findAdjacentPosts = async (createdAt: Date) => {
  const repo = AppDataSource.getRepository(Post);

  const prev = await repo
    .createQueryBuilder("post")
    .where("post.createdAt < :createdAt", { createdAt })
    .andWhere("post.isSuspended = :isSuspended", { isSuspended: false })
    .orderBy("post.createdAt", "DESC")
    .getOne();

  const next = await repo
    .createQueryBuilder("post")
    .where("post.createdAt > :createdAt", { createdAt })
    .andWhere("post.isSuspended = :isSuspended", { isSuspended: false })
    .orderBy("post.createdAt", "ASC")
    .getOne();

  return { prev, next };
};

export const findRecentPosts = async (id: string, limit = 5) => {
  return AppDataSource.getRepository(Post)
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.mainCategory", "mainCategory")
    .leftJoinAndSelect("post.subCategory", "subCategory")
    .leftJoinAndSelect("post.tags", "tags")
    .leftJoinAndSelect("post.media", "media")
    .where("post.id != UNHEX(REPLACE(:id, '-', ''))", { id })
    .andWhere("post.isSuspended = :isSuspended", { isSuspended: false })
    .orderBy("post.createdAt", "DESC")
    .addOrderBy("media.order", "ASC")
    .take(limit)
    .getMany();
};

export const findAllTags = async () => {
  const tags = await AppDataSource.getRepository(Tag)
    .createQueryBuilder("tag")
    .innerJoin(
      "tag.posts",
      "post",
      "post.isSuspended = :isSuspended",
      { isSuspended: false },
    )
    .select("tag.name")
    .orderBy("tag.name", "ASC")
    .getMany();

  return tags.map((t) => t.name);
};
