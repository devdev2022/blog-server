import * as mainDao from "./mainDao";

export const getRecentPosts = async () => {
  const posts = await mainDao.findRecentPosts();

  return posts.map((post) => ({
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
  }));
};

export const getTechStacks = async () => {
  const techStacks = await mainDao.findTechStacks();

  return techStacks.map((ts) => ({
    id: ts.id,
    name: ts.name,
    iconUrl: ts.iconUrl,
    category: ts.category ? { id: ts.category.id, name: ts.category.name } : null,
  }));
};
