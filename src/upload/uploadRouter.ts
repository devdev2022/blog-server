import { Router } from "express";
import { imageUpload, videoUpload } from "../utils/upload";
import { uploadImageHandler, uploadVideoHandler } from "./uploadController";
import { validateAccessToken } from "../utils/tokenValidation";

const router = Router();

router.post("/image", validateAccessToken, imageUpload.single("image"), uploadImageHandler);
router.post("/video", validateAccessToken, videoUpload.single("video"), uploadVideoHandler);

export default router;
