import express from "express";

import validateRequest from "../../../middlewares/validateRequest";
import { RydrOnboardingValidation } from "./rydr.onboarding.validation";
import { RydrOnboardingControllers } from "./rydr.onboarding.controller";

const router = express.Router();

router.post(
  "/",
  validateRequest(RydrOnboardingValidation.rydrOnboardingValidationSchema),
  RydrOnboardingControllers.rydrOnboarding,
);
// router.post(
//   "/verify-email_otp",
//   validateRequest(AuthValidation.verifyOTPValidationSchema),
//   AuthControllers.verifyOTP,
// );

// router.post(
//   "/change-password",
//   auth(USER_ROLE.CUSTOMER, USER_ROLE.SELLER),
//   validateRequest(AuthValidation.changePasswordValidationSchema),
//   AuthControllers.changePassword,
// );
// // logout endpoint doesn't need a valid access token; clearing the
// // cookies should always be allowed (client might be calling after the
// // token has already expired).
// router.post("/logout", AuthControllers.logout);

// router.post(
//   "/refresh-token",
//   validateRequestCookies(AuthValidation.refreshTokenValidationSchema),
//   AuthControllers.refreshToken,
// );

export const RydrOnboardingRoutes = router;
