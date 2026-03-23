import * as postsDao from "./postsDao";
import { deleteFromR2 } from "../utils/r2";
import { MainCategory } from "../../entity/MainCategory";
import { SubCategory } from "../../entity/SubCategory";

function extractMediaFromContent(content: string) {
  const r2Base = process.env.R2_PUBLIC_URL;
  const media: { type: "image" | "video"; url: string; order: number }[] = [];
  let order = 0;

  const imgRegex = /<img[^>]+src="([^"]+)"/g;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    if (r2Base && match[1].startsWith(r2Base)) {
      media.push({ type: "image", url: match[1], order: order++ });
    }
  }

  const videoRegex = /<video[^>]+src="([^"]+)"/g;
  while ((match = videoRegex.exec(content)) !== null) {
    if (r2Base && match[1].startsWith(r2Base)) {
      media.push({ type: "video", url: match[1], order: order++ });
    }
  }

  return media;
}

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

  const media = extractMediaFromContent(data.content);
  await postsDao.replacePostMedia(id, media);

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

  const media = extractMediaFromContent(data.content);
  await postsDao.replacePostMedia(post.id, media);

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

export const deleteDraft = async (id: string, userId: string) => {
  await postsDao.deleteDraftByIdAndUserId(id, userId);
};

export const getDraftList = async (userId: string) => {
  const drafts = await postsDao.findDraftsByUserId(userId);
  return {
    total: drafts.length,
    drafts: drafts.map((draft) => ({
      id: draft.id,
      title: draft.title,
      createdAt: draft.createdAt,
    })),
  };
};

export const getDraftById = async (id: string, userId: string) => {
  const draft = await postsDao.findDraftByIdAndUserId(id, userId);
  if (!draft) return null;

  const categorySlug = draft.mainCategory
    ? draft.subCategory
      ? `${draft.mainCategory.name}/${draft.subCategory.name}`
      : draft.mainCategory.name
    : '';

  return {
    id: draft.id,
    title: draft.title,
    content: draft.content,
    categorySlug,
    tags: (draft.tags ?? []).map((tag: any) => tag.name),
    createdAt: draft.createdAt,
  };
};

export const deletePost = async (id: string) => {
  const existing = await postsDao.findPostById(id);
  if (!existing) return null;

  const mediaUrls = (existing.media ?? []).map((m: any) => m.url);
  const urlsToDelete = await postsDao.filterUnsharedUrls(id, mediaUrls);
  await postsDao.deletePost(id);
  await Promise.all(urlsToDelete.map(deleteFromR2));

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
