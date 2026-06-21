import { Router } from "express";
import { imageUpload, videoUpload } from "../utils/upload";
import { uploadImageHandler, uploadVideoHandler } from "./uploadController";
import { validateAccessToken } from "../utils/tokenValidation";

const router = Router();

router.post("/image", validateAccessToken, (req, _res, next) => { (req as any).query.folder = "posts"; next(); }, imageUpload.single("image"), uploadImageHandler);
router.post("/video", validateAccessToken, (req, _res, next) => { (req as any).query.folder = "posts"; next(); }, videoUpload.single("video"), uploadVideoHandler);

export default router;
