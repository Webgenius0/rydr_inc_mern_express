import express from "express";
import { FaqController } from "./faq.controller";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../User/user.constant";
import validateRequest from "../../middlewares/validateRequest";
import { createFaqSchema } from "./faq.validation";

const router = express.Router();

// Public/Admin list
router.get("/page/:pageKey", FaqController.getFaqsByPage);

// Admin
router.post("/", auth(USER_ROLE.SELLER), validateRequest(createFaqSchema), FaqController.createFaq);
router.patch("/:id", auth(USER_ROLE.SELLER), FaqController.updateFaq);
router.delete("/:id", auth(USER_ROLE.SELLER), FaqController.deleteFaq);

export const FaqRoutes = router;