import express from "express";
import { UserControllers } from "./user.controller";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "./user.constant";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation"; 
import { profileUpload } from "../../shared/upload/profileUpload";

const router = express.Router();

router.get("/", auth(USER_ROLE.SELLER), UserControllers.getAllUsers);
router.get(
  "/getMe",
  auth(USER_ROLE.SELLER, USER_ROLE.CUSTOMER),
  UserControllers.getMe,
);

router.get("/:id", auth(USER_ROLE.SELLER), UserControllers.getSingleUser);
router.get(
  "/:id/activity",
  auth(USER_ROLE.SELLER),
  UserControllers.getUserActivityLog,
);
router.patch(
  "/updateProfile",
  auth(USER_ROLE.CUSTOMER, USER_ROLE.SELLER),
  profileUpload.single("profilePhoto"),
  validateRequest(UserValidation.updateUserProfileSchema),
  UserControllers.updateProfile,
);
router.patch("/:id/block", auth(USER_ROLE.SELLER), UserControllers.blockUser);
router.patch(
  "/:id/unblock",
  auth(USER_ROLE.SELLER),
  UserControllers.unblockUser,
);

router.post(
  "/create-user",
  auth(USER_ROLE.SELLER),
  validateRequest(UserValidation.createUserValidationSchema),
  UserControllers.userRegister,
);

export const UserRoutes = router;
