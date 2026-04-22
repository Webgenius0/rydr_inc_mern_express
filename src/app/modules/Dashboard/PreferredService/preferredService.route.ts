import express from "express";

import auth from "../../../middlewares/auth";
import { USER_ROLE } from "../../User/user.constant";
import validateRequest from "../../../middlewares/validateRequest";
import { RydrPreferredServiceValidation } from "./preferredService.validation";
import { PreferredServiceControllers } from "./preferredService.controller";

const router = express.Router();

router.get("/", PreferredServiceControllers.getAllPreferredServices);

router.get(
  "/:id",
  validateRequest(
    RydrPreferredServiceValidation.getPreferredServiceByIdValidationSchema,
  ),
  PreferredServiceControllers.getPreferredServiceById,
);

router.post(
  "/",
  auth(USER_ROLE.ADMIN, USER_ROLE.DRIVER),
  validateRequest(
    RydrPreferredServiceValidation.createPreferredServiceValidationSchema,
  ),
  PreferredServiceControllers.createPreferredService,
);

router.patch(
  "/:id",
  auth(USER_ROLE.ADMIN, USER_ROLE.DRIVER),
  validateRequest(
    RydrPreferredServiceValidation.updatePreferredServiceValidationSchema,
  ),
  PreferredServiceControllers.updatePreferredService,
);

router.delete(
  "/:id",
  auth(USER_ROLE.ADMIN, USER_ROLE.DRIVER),
  validateRequest(
    RydrPreferredServiceValidation.getPreferredServiceByIdValidationSchema,
  ),
  PreferredServiceControllers.deletePreferredService,
);

export const PreferredServiceRoutes = router;
