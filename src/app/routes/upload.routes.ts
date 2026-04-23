import { Router } from "express";
import { UploadRoutes } from "../modules/Upload/upload.route";

const router = Router();

router.use("/upload", UploadRoutes);

export default router;
