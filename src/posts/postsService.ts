import * as postsDao from "./postsDao";
import { MainCategory } from "../../entity/MainCategory";
import { SubCategory } from "../../entity/SubCategory";

interface GetPostListParams {
  page: number;
  limit: number;
  mainCategory?: string;
  subCategory?: string;
  tag?: string;
}

export const getPostList = async (params: GetPostListParams) => {
  const { posts, total } = await postsDao.findPosts(params);

  return {
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      editedAt: post.editedAt,
      mainCategory: post.mainCategory
        ? { id: post.mainCategory.id, name: post.mainCategory.name }
        : null,
      subCategory: post.subCategory
        ? {
            id: post.subCategory.id,
            name: post.subCategory.name,
            mainCategory: post.mainCategory
              ? { id: post.mainCategory.id, name: post.mainCategory.name }
              : null,
          }
        : null,
      tags: post.tags.map((tag) => ({ id: tag.id, name: tag.name })),
      media: post.media.map((m) => ({
        id: m.id,
        type: m.type,
        url: m.url,
        order: m.order,
      })),
    })),
    total,
    page: params.page,
    limit: params.limit,
  };
};

interface SubCategoryWithCount extends SubCategory {
  postCount: number;
}

interface MainCategoryWithCount extends MainCategory {
  postCount: number;
  subCategories: SubCategoryWithCount[];
}

export const getCategoryList = async () => {
  const [categories, total] = await Promise.all([
    postsDao.findAllCategories() as Promise<MainCategoryWithCount[]>,
    postsDao.findTotalPostCount(),
  ]);

  return {
    total,
    categories: categories.map((main) => ({
      id: main.id,
      name: main.name,
      slug: main.name,
      postCount: main.postCount ?? 0,
      subCategories: main.subCategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        slug: `${main.name}/${sub.name}`,
        postCount: sub.postCount ?? 0,
      })),
    })),
  };
};

export const getTagList = async () => {
  return postsDao.findAllTags();
};

const toPostSummary = (post: any) => ({
  id: post.id,
  title: post.title,
  content: post.content,
  createdAt: post.createdAt,
  editedAt: post.editedAt,
  mainCategory: post.mainCategory
    ? { id: post.mainCategory.id, name: post.mainCategory.name }
    : null,
  subCategory: post.subCategory
    ? {
        id: post.subCategory.id,
        name: post.subCategory.name,
        mainCategory: post.mainCategory
          ? { id: post.mainCategory.id, name: post.mainCategory.name }
          : null,
      }
    : null,
  tags: (post.tags ?? []).map((tag: any) => ({ id: tag.id, name: tag.name })),
  media: (post.media ?? []).map((m: any) => ({
    id: m.id,
    type: m.type,
    url: m.url,
    order: m.order,
  })),
});

export const updatePost = async (
  id: string,
  data: { title: string; content: string; categorySlug: string; tags: string[] },
) => {
  const existing = await postsDao.findPostById(id);
  if (!existing) return null;

  const parts = data.categorySlug.split("/");
  const mainName = parts[0];
  const subName = parts[1];

  const mainCategory = mainName
    ? await postsDao.findMainCategoryByName(mainName)
    : null;
  if (mainName && !mainCategory) throw new Error("카테고리를 찾을 수 없습니다.");

  let subCategoryId: string | null = null;
  if (subName && mainCategory) {
    const subCategory = await postsDao.findSubCategoryByName(
      subName,
      mainCategory.id,
    );
    subCategoryId = subCategory?.id ?? null;
  }

  await postsDao.updatePost(id, {
    title: data.title,
    content: data.content,
    mainCategoryId: mainCategory?.id ?? null,
    subCategoryId,
  });

  const tags = await postsDao.findOrCreateTags(data.tags);
  await postsDao.replacePostTags(id, tags.map((t) => t.id));

  return true;
};

export const createPost = async (
  userId: string,
  data: { title: string; content: string; categorySlug: string; tags: string[] },
) => {
  const parts = data.categorySlug.split("/");
  const mainName = parts[0];
  const subName = parts[1];

  const mainCategory = mainName
    ? await postsDao.findMainCategoryByName(mainName)
    : null;
  if (mainName && !mainCategory) throw new Error("카테고리를 찾을 수 없습니다.");

  let subCategoryId: string | null = null;
  if (subName && mainCategory) {
    const subCategory = await postsDao.findSubCategoryByName(subName, mainCategory.id);
    subCategoryId = subCategory?.id ?? null;
  }

  const post = await postsDao.createPost({
    userId,
    title: data.title,
    content: data.content,
    mainCategoryId: mainCategory?.id ?? null,
    subCategoryId,
  });

  const tags = await postsDao.findOrCreateTags(data.tags);
  await postsDao.replacePostTags(post.id, tags.map((t) => t.id));

  return { id: post.id };
};

export const createDraft = async (
  userId: string,
  data: { title: string; content: string; categorySlug: string; tags: string[] },
) => {
  const parts = data.categorySlug.split("/");
  const mainName = parts[0];
  const subName = parts[1];

  const mainCategory = mainName
    ? await postsDao.findMainCategoryByName(mainName)
    : null;
  if (mainName && !mainCategory) throw new Error("카테고리를 찾을 수 없습니다.");

  let subCategoryId: string | null = null;
  if (subName && mainCategory) {
    const subCategory = await postsDao.findSubCategoryByName(subName, mainCategory.id);
    subCategoryId = subCategory?.id ?? null;
  }

  const draft = await postsDao.createDraft({
    userId,
    title: data.title,
    content: data.content,
    mainCategoryId: mainCategory?.id ?? null,
    subCategoryId,
  });

  const tags = await postsDao.findOrCreateTags(data.tags);
  await postsDao.replacePostTags(draft.id, tags.map((t) => t.id));

  return { id: draft.id };
};

export const updateDraft = async (
  id: string,
  data: { title: string; content: string; categorySlug: string; tags: string[] },
) => {
  const existing = await postsDao.findDraftById(id);
  if (!existing) return null;

  const parts = data.categorySlug.split("/");
  const mainName = parts[0];
  const subName = parts[1];

  const mainCategory = mainName
    ? await postsDao.findMainCategoryByName(mainName)
    : null;
  if (mainName && !mainCategory) throw new Error("카테고리를 찾을 수 없습니다.");

  let subCategoryId: string | null = null;
  if (subName && mainCategory) {
    const subCategory = await postsDao.findSubCategoryByName(subName, mainCategory.id);
    subCategoryId = subCategory?.id ?? null;
  }

  await postsDao.updateDraftPost(id, {
    title: data.title,
    content: data.content,
    mainCategoryId: mainCategory?.id ?? null,
    subCategoryId,
  });

  const tags = await postsDao.findOrCreateTags(data.tags);
  await postsDao.replacePostTags(id, tags.map((t) => t.id));

  return true;
};

export const getPostById = async (id: string) => {
  const post = await postsDao.findPostById(id);
  if (!post) return null;

  const { prev, next } = await postsDao.findAdjacentPosts(post.createdAt);
  const recentPosts = await postsDao.findRecentPosts(id);

  return {
    post: toPostSummary(post),
    prevPost: prev ? toPostSummary(prev) : null,
    nextPost: next ? toPostSummary(next) : null,
    recentPosts: recentPosts.map(toPostSummary),
  };
};
