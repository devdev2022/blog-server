import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { WorkExperience } from "../../entity/WorkExperience";
import { SideProject } from "../../entity/SideProject";
import { TechStack } from "../../entity/TechStack";

export const findProfile = async () => {
  return AppDataSource.getRepository(User)
    .createQueryBuilder("user")
    .select(["user.id", "user.username", "user.bioAvatar", "user.bio", "user.role"])
    .where("user.github_id = :githubId", { githubId: Number(process.env.BLOG_OWNER_GITHUB_ID) })
    .getOne();
};

export const updateBio = async (userId: string, bio: string) => {
  await AppDataSource.getRepository(User).update({ id: userId }, { bio });
};

export const updateAvatar = async (userId: string, avatarUrl: string) => {
  await AppDataSource.getRepository(User).update({ id: userId }, { bioAvatar: avatarUrl });
};

export const findWorkExperiences = async () => {
  return AppDataSource.getRepository(WorkExperience)
    .createQueryBuilder("work")
    .leftJoinAndSelect("work.techStacks", "techStack")
    .orderBy("work.startDate", "DESC")
    .getMany();
};

export const findSideProjects = async () => {
  return AppDataSource.getRepository(SideProject)
    .createQueryBuilder("project")
    .leftJoinAndSelect("project.techStacks", "techStack")
    .orderBy("project.startDate", "DESC")
    .getMany();
};

export const findTechStacks = async () => {
  return AppDataSource.getRepository(TechStack)
    .createQueryBuilder("techStack")
    .leftJoinAndSelect("techStack.category", "category")
    .orderBy("techStack.name", "ASC")
    .getMany();
};
