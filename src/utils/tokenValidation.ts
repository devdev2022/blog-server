import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../data-source";
import { RefreshToken } from "../../entity/RefreshToken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const validateAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as {
      userId: string;
    };
    req.userId = decoded.userId;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as {
        userId: string;
      };
      req.userId = decoded.userId;
    } catch {
      // 토큰이 유효하지 않아도 통과 (비로그인 취급)
    }
  }
  next();
};

export const validateTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken as string;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY!
    ) as { userId: string };

    const stored = await AppDataSource.getRepository(RefreshToken).findOne({
      where: { user_id: decoded.userId, token: refreshToken },
    });

    if (!stored) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};
