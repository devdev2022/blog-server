import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { RefreshToken } from "../../entity/RefreshToken";

export const findUserByGithubId = async (githubId: number) => {
  return AppDataSource.getRepository(User).findOne({
    where: { github_id: githubId },
  });
};

export const createUser = async (
  githubId: number,
  username: string,
  avatarUrl: string
) => {
  const userRepo = AppDataSource.getRepository(User);
  const user = userRepo.create({
    github_id: githubId,
    username,
    profileAvatar: avatarUrl,
  });
  return userRepo.save(user);
};

export const saveRefreshToken = async (userId: string, token: string) => {
  const refreshTokenRepo = AppDataSource.getRepository(RefreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  await refreshTokenRepo.delete({ user_id: userId });

  const refreshToken = refreshTokenRepo.create({
    user_id: userId,
    token,
    expires_at: expiresAt,
  });
  return refreshTokenRepo.save(refreshToken);
};

export const findUserById = async (userId: string) => {
  return AppDataSource.getRepository(User).findOne({ where: { id: userId } });
};

export const deleteRefreshToken = async (userId: string) => {
  return AppDataSource.getRepository(RefreshToken).delete({ user_id: userId });
};
