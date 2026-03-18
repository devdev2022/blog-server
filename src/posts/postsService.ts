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
  const categories =
    (await postsDao.findAllCategories()) as MainCategoryWithCount[];

  return categories.map((main) => ({
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
  }));
};

export const getTagList = async () => {
  return postsDao.findAllTags();
};

const toPostSummary = (post: any) => ({
  id: post.id.replaceAll("-", ""),
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
