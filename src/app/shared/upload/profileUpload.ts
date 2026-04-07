import multer from "multer";
import path from "path";
import fs from "fs";
import AppError from "../../errors/AppError";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "./upload.constants";

import os from "os";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(new AppError(400, "Only JPG, JPEG, PNG and WEBP allowed"));
  }
  cb(null, true);
};

export const profileUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});