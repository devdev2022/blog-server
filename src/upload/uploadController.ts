import { Request, Response } from "express";
import { catchAsync } from "../utils/error";

export const uploadImageHandler = catchAsync(
  async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File & { key: string };
    const url = `${process.env.R2_PUBLIC_URL}/${file.key}`;
    res.status(200).json({ url });
  }
);

export const uploadVideoHandler = catchAsync(
  async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File & { key: string };
    const url = `${process.env.R2_PUBLIC_URL}/${file.key}`;
    res.status(200).json({ url });
  }
);
