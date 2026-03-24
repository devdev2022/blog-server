import { AppDataSource } from "../../data-source";
import { Post } from "../../entity/Posts";
import { PostMedia } from "../../entity/PostMedia";
import { MainCategory } from "../../entity/MainCategory";
import { SubCategory } from "../../entity/SubCategory";
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
    .andWhere("post.temp = :temp", { temp: false })
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
       WHERE main_category_id = $1
       AND sub_category_id IS NULL
       AND is_suspended = false
       AND temp = false`,
      [main.id],
    );
    (main as any).postCount = parseInt(mainCount as string, 10);

    for (const sub of main.subCategories) {
      const [{ count }] = await AppDataSource.query(
        `SELECT COUNT(*) as count FROM posts
         WHERE sub_category_id = $1
         AND is_suspended = false
         AND temp = false`,
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
    .where("post.id = :id", { id })
    .andWhere("post.isSuspended = :isSuspended", { isSuspended: false })
    .andWhere("post.temp = :temp", { temp: false })
    .addOrderBy("media.order", "ASC")
    .getOne();
};

export const findAdjacentPosts = async (createdAt: Date) => {
  const repo = AppDataSource.getRepository(Post);

  const prev = await repo
    .createQueryBuilder("post")
    .where("post.createdAt < :createdAt", { createdAt })
    .andWhere("post.isSuspended = :isSuspended", { isSuspended: false })
    .andWhere("post.temp = :temp", { temp: false })
    .orderBy("post.createdAt", "DESC")
    .getOne();

  const next = await repo
    .createQueryBuilder("post")
    .where("post.createdAt > :createdAt", { createdAt })
    .andWhere("post.isSuspended = :isSuspended", { isSuspended: false })
    .andWhere("post.temp = :temp", { temp: false })
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
    .where("post.id != :id", { id })
    .andWhere("post.isSuspended = :isSuspended", { isSuspended: false })
    .andWhere("post.temp = :temp", { temp: false })
    .orderBy("post.createdAt", "DESC")
    .addOrderBy("media.order", "ASC")
    .take(limit)
    .getMany();
};

export const findMainCategoryByName = async (name: string) => {
  return AppDataSource.getRepository(MainCategory).findOne({ where: { name } });
};

export const findSubCategoryByName = async (
  name: string,
  mainCategoryId: string,
) => {
  return AppDataSource.getRepository(SubCategory).findOne({
    where: { name, mainCategory: { id: mainCategoryId } },
  });
};

export const updatePost = async (
  id: string,
  data: {
    title: string;
    content: string;
    mainCategoryId: string | null;
    subCategoryId: string | null;
  },
) => {
  if (data.mainCategoryId && data.subCategoryId) {
    await AppDataSource.query(
      `UPDATE posts SET title = $1, content = $2, main_category_id = $3, sub_category_id = $4, edited_at = NOW() WHERE id = $5`,
      [data.title, data.content, data.mainCategoryId, data.subCategoryId, id],
    );
  } else if (data.mainCategoryId) {
    await AppDataSource.query(
      `UPDATE posts SET title = $1, content = $2, main_category_id = $3, sub_category_id = NULL, edited_at = NOW() WHERE id = $4`,
      [data.title, data.content, data.mainCategoryId, id],
    );
  } else {
    await AppDataSource.query(
      `UPDATE posts SET title = $1, content = $2, main_category_id = NULL, sub_category_id = NULL, edited_at = NOW() WHERE id = $3`,
      [data.title, data.content, id],
    );
  }
};

export const findOrCreateTags = async (names: string[]) => {
  const tagRepo = AppDataSource.getRepository(Tag);
  const tags = [];
  for (const name of names) {
    let tag = await tagRepo.findOne({ where: { name } });
    if (!tag) {
      tag = tagRepo.create({ name });
      await tagRepo.save(tag);
    }
    tags.push(tag);
  }
  return tags;
};

export const replacePostTags = async (postId: string, tagIds: string[]) => {
  await AppDataSource.query(
    `DELETE FROM post_tags WHERE post_id = $1`,
    [postId],
  );
  for (const tagId of tagIds) {
    await AppDataSource.query(
      `INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)`,
      [postId, tagId],
    );
  }
};

export const createDraft = async (data: {
  userId: string;
  title: string;
  content: string;
  mainCategoryId: string | null;
  subCategoryId: string | null;
}) => {
  const repo = AppDataSource.getRepository(Post);
  const draft = repo.create({
    userId: data.userId,
    title: data.title,
    content: data.content,
    mainCategoryId: data.mainCategoryId,
    subCategoryId: data.subCategoryId,
    temp: true,
  });
  return repo.save(draft);
};

export const createPost = async (data: {
  userId: string;
  title: string;
  content: string;
  mainCategoryId: string | null;
  subCategoryId: string | null;
}) => {
  const repo = AppDataSource.getRepository(Post);
  const post = repo.create({
    userId: data.userId,
    title: data.title,
    content: data.content,
    mainCategoryId: data.mainCategoryId,
    subCategoryId: data.subCategoryId,
    temp: false,
  });
  return repo.save(post);
};

export const findDraftById = async (id: string) => {
  return AppDataSource.getRepository(Post)
    .createQueryBuilder("post")
    .where("post.id = :id", { id })
    .andWhere("post.temp = :temp", { temp: true })
    .getOne();
};

export const updateDraftPost = async (
  id: string,
  data: {
    title: string;
    content: string;
    mainCategoryId: string | null;
    subCategoryId: string | null;
  },
) => {
  if (data.mainCategoryId && data.subCategoryId) {
    await AppDataSource.query(
      `UPDATE posts SET title = $1, content = $2, main_category_id = $3, sub_category_id = $4 WHERE id = $5 AND temp = true`,
      [data.title, data.content, data.mainCategoryId, data.subCategoryId, id],
    );
  } else if (data.mainCategoryId) {
    await AppDataSource.query(
      `UPDATE posts SET title = $1, content = $2, main_category_id = $3, sub_category_id = NULL WHERE id = $4 AND temp = true`,
      [data.title, data.content, data.mainCategoryId, id],
    );
  } else {
    await AppDataSource.query(
      `UPDATE posts SET title = $1, content = $2, main_category_id = NULL, sub_category_id = NULL WHERE id = $3 AND temp = true`,
      [data.title, data.content, id],
    );
  }
};

export const deletePost = async (id: string) => {
  await AppDataSource.query(
    `DELETE FROM posts WHERE id = $1 AND temp = false`,
    [id],
  );
};

export const filterUnsharedUrls = async (postId: string, urls: string[]): Promise<string[]> => {
  if (urls.length === 0) return [];
  const unshared: string[] = [];
  for (const url of urls) {
    const [{ count }] = await AppDataSource.query(
      `SELECT COUNT(*) as count FROM post_media WHERE url = $1 AND post_id != $2`,
      [url, postId],
    );
    if (parseInt(count as string, 10) === 0) {
      unshared.push(url);
    }
  }
  return unshared;
};

export const findTotalPostCount = async () => {
  const [{ count }] = await AppDataSource.query(
    `SELECT COUNT(*) as count FROM posts WHERE is_suspended = false AND temp = false`,
  );
  return parseInt(count as string, 10);
};

export const deleteDraftByIdAndUserId = async (id: string, userId: string) => {
  await AppDataSource.query(
    `DELETE FROM posts WHERE id = $1 AND user_id = $2 AND temp = true`,
    [id, userId],
  );
};

export const findDraftsByUserId = async (userId: string) => {
  return AppDataSource.getRepository(Post)
    .createQueryBuilder("post")
    .where("post.userId = :userId", { userId })
    .andWhere("post.temp = :temp", { temp: true })
    .orderBy("post.createdAt", "DESC")
    .getMany();
};

export const findDraftByIdAndUserId = async (id: string, userId: string) => {
  return AppDataSource.getRepository(Post)
    .createQueryBuilder("post")
    .leftJoinAndSelect("post.tags", "tags")
    .leftJoinAndSelect("post.mainCategory", "mainCategory")
    .leftJoinAndSelect("post.subCategory", "subCategory")
    .where("post.id = :id", { id })
    .andWhere("post.userId = :userId", { userId })
    .andWhere("post.temp = :temp", { temp: true })
    .getOne();
};

export const replacePostMedia = async (
  postId: string,
  mediaList: { type: "image" | "video"; url: string; order: number }[],
): Promise<string[]> => {
  const existing: { url: string }[] = await AppDataSource.query(
    `SELECT url FROM post_media WHERE post_id = $1`,
    [postId],
  );

  const newUrls = new Set(mediaList.map((m) => m.url));
  const removedUrls = existing.filter((m) => !newUrls.has(m.url)).map((m) => m.url);

  await AppDataSource.query(
    `DELETE FROM post_media WHERE post_id = $1`,
    [postId],
  );
  const repo = AppDataSource.getRepository(PostMedia);
  for (const item of mediaList) {
    const media = repo.create({ postId, type: item.type, url: item.url, order: item.order });
    await repo.save(media);
  }

  return removedUrls;
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
