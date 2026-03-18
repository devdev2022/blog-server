import * as aboutDao from "./aboutDao";

export const updateBio = async (userId: string, bio: string) => {
  await aboutDao.updateBio(userId, bio);
};

export const updateAvatar = async (userId: string, avatarUrl: string) => {
  await aboutDao.updateAvatar(userId, avatarUrl);
};

export const getProfile = async () => {
  const user = await aboutDao.findProfile();
  if (!user) return null;

  return {
    username: user.username,
    bio_avatar: user.bioAvatar ?? null,
    bio: user.bio ?? null,
    role: user.role,
  };
};

export const getWorkExperiences = async () => {
  const experiences = await aboutDao.findWorkExperiences();

  return experiences.map((exp) => ({
    id: exp.id,
    company: exp.company,
    position: exp.position,
    description: exp.description,
    startDate: exp.startDate,
    endDate: exp.endDate,
    isCurrent: exp.isCurrent,
    techStacks: exp.techStacks.map((t) => ({
      id: t.id,
      name: t.name,
      iconUrl: t.iconUrl,
    })),
  }));
};

export const getSideProjects = async () => {
  const projects = await aboutDao.findSideProjects();

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    startDate: project.startDate,
    endDate: project.endDate,
    link: project.link,
    techStacks: project.techStacks.map((t) => ({
      id: t.id,
      name: t.name,
      iconUrl: t.iconUrl,
    })),
  }));
};

export const getTechStacks = async () => {
  const techStacks = await aboutDao.findTechStacks();

  return techStacks.map((t) => ({
    id: t.id,
    name: t.name,
    iconUrl: t.iconUrl,
  }));
};
