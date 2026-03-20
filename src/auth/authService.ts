import jwt from "jsonwebtoken";
import * as authDao from "./authDao";
import { customError } from "../utils/error";

const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";

interface GithubUser {
  id: number;
  login: string;
  avatar_url: string;
}

const getGithubAccessToken = async (code: string): Promise<string> => {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI,
    }),
  });

  const data: any = await response.json();
  if (data.error) {
    customError(`GitHub OAuth error: ${data.error_description}`, 400);
  }
  return data.access_token;
};

const getGithubUser = async (accessToken: string): Promise<GithubUser> => {
  const response = await fetch(GITHUB_USER_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    customError("Failed to fetch GitHub user info", 400);
  }
  return response.json() as Promise<GithubUser>;
};

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET_KEY!, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET_KEY!,
    { expiresIn: "14d" }
  );
  return { accessToken, refreshToken };
};

export const githubLogin = async (code: string) => {
  const githubAccessToken = await getGithubAccessToken(code);
  const githubUser = await getGithubUser(githubAccessToken);

  let user = await authDao.findUserByGithubId(githubUser.id);
  const isNewUser = !user;

  if (!user) {
    user = await authDao.createUser(
      githubUser.id,
      githubUser.login,
      githubUser.avatar_url
    );
  } else if (user.withdrawal) {
    user = await authDao.reactivateUser(
      user.id,
      githubUser.login,
      githubUser.avatar_url
    );
  }

  const { accessToken, refreshToken } = generateTokens(user!.id);
  await authDao.saveRefreshToken(user!.id, refreshToken);

  return { accessToken, refreshToken, user: user!, isNewUser };
};

export const reissueAccessToken = async (userId: string) => {
  const user = await authDao.findUserById(userId);
  if (!user) customError("User not found", 404);

  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET_KEY!, {
    expiresIn: "1h",
  });
  return { accessToken, user: user! };
};

export const logOut = async (userId: string) => {
  await authDao.deleteRefreshToken(userId);
};
