import * as usersDao from "./usersDao";
import { customError } from "../utils/error";

const NICKNAME_REGEX = /^[a-zA-Z0-9]{5,30}$/;

export const getMyProfile = async (userId: string) => {
  const user = await usersDao.findUserById(userId);
  if (!user) customError("유저를 찾을 수 없습니다.", 404);

  return {
    nickname: user!.username,
    blog_nickname: user!.blogNickname ?? null,
    bio: user!.bio ?? null,
    profile_avatar: user!.profileAvatar ?? null,
  };
};

export const checkBlogNicknameAvailability = async (
  value: string,
  requesterId: string
) => {
  if (!NICKNAME_REGEX.test(value)) {
    customError(
      "블로그 닉네임은 영문, 숫자만 사용할 수 있으며 5~30자여야 합니다.",
      400
    );
  }

  const existing = await usersDao.findUserByBlogNickname(value);

  // 본인이 이미 사용 중인 닉네임은 사용 가능으로 처리
  if (existing && existing.id !== requesterId) {
    return { available: false };
  }
  return { available: true };
};

export const updateMyProfile = async (
  userId: string,
  data: {
    nickname: string;
    blog_nickname: string | null;
    bio: string | null;
    profile_avatar: string | null;
  }
) => {
  if (!data.nickname || !NICKNAME_REGEX.test(data.nickname.trim())) {
    customError("닉네임은 영문, 숫자만 사용할 수 있으며 5~30자여야 합니다.", 400);
  }

  if (data.blog_nickname !== null) {
    if (!NICKNAME_REGEX.test(data.blog_nickname)) {
      customError(
        "블로그 닉네임은 영문, 숫자만 사용할 수 있으며 5~30자여야 합니다.",
        400
      );
    }

    const existing = await usersDao.findUserByBlogNickname(data.blog_nickname);
    if (existing && existing.id !== userId) {
      customError("이미 사용 중인 블로그 닉네임입니다.", 409);
    }
  }

  await usersDao.updateUserProfile(userId, {
    username: data.nickname.trim(),
    blogNickname: data.blog_nickname,
    bio: data.bio,
    profileAvatar: data.profile_avatar,
  });
};

export const deleteMyAccount = async (userId: string) => {
  await usersDao.withdrawUser(userId);
};
