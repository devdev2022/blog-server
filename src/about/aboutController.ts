import { Request, Response } from "express";
import * as aboutService from "./aboutService";
import { catchAsync } from "../utils/error";

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await aboutService.getProfile();
  res.status(200).json(result);
});

export const getWorkExperiences = catchAsync(
  async (req: Request, res: Response) => {
    const result = await aboutService.getWorkExperiences();
    res.status(200).json(result);
  },
);

export const getSideProjects = catchAsync(
  async (req: Request, res: Response) => {
    const result = await aboutService.getSideProjects();
    res.status(200).json(result);
  },
);

export const getTechStacks = catchAsync(
  async (req: Request, res: Response) => {
    const result = await aboutService.getTechStacks();
    res.status(200).json(result);
  },
);
