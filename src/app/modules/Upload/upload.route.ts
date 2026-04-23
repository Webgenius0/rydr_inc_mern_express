import { Router } from "express";
import { uploadFiles, deleteFiles } from "./upload.controller";

const router = Router();

router.post("/", uploadFiles);
router.delete("/", deleteFiles);

export const UploadRoutes = router;
