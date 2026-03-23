import { Request, Response } from "express";
import { catchAsync } from "../utils/error";

export const uploadImageHandler = catchAsync(
  async (req: Request, res: Response) => {
    const file = req.file as (Express.Multer.File & { key: string }) | undefined;
    if (!file) {
      res.status(400).json({ message: "업로드된 파일이 없습니다." });
      return;
    }
    const url = `${process.env.R2_PUBLIC_URL}/${file.key}`;
    res.status(200).json({ url });
  }
);

export const uploadVideoHandler = catchAsync(
  async (req: Request, res: Response) => {
    const file = req.file as (Express.Multer.File & { key: string }) | undefined;
    if (!file) {
      res.status(400).json({ message: "업로드된 파일이 없습니다." });
      return;
    }
    const url = `${process.env.R2_PUBLIC_URL}/${file.key}`;
    res.status(200).json({ url });
  }
);
