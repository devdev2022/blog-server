import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { RefreshToken } from "../../entity/RefreshToken";

export const findUserById = async (userId: string) => {
  return AppDataSource.getRepository(User).findOne({ where: { id: userId } });
};

export const findUserByBlogNickname = async (blogNickname: string) => {
  return AppDataSource.getRepository(User).findOne({
    where: { blogNickname },
  });
};

export const updateUserProfile = async (
  userId: string,
  data: {
    username: string;
    blogNickname: string | null;
    bio: string | null;
    profileAvatar: string | null;
  }
) => {
  await AppDataSource.getRepository(User).update(
    { id: userId },
    {
      username: data.username,
      blogNickname: data.blogNickname,
      bio: data.bio,
      profileAvatar: data.profileAvatar,
    }
  );
};

export const withdrawUser = async (userId: string) => {
  await AppDataSource.getRepository(RefreshToken).delete({ user_id: userId });
  await AppDataSource.query(
    `UPDATE users SET withdrawal = 1, withdrawal_date = NOW() WHERE id = UNHEX(REPLACE(?, '-', ''))`,
    [userId]
  );
};
