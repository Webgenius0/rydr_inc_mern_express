import multer from "multer";
import AppError from "../../errors/AppError";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "./upload.constants";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(new AppError(400, "Only JPG, JPEG, PNG and WEBP images are allowed"));
    return;
  }

  cb(null, true);
};
export const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});
