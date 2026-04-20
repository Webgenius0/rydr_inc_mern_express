import express from "express";

import validateRequest, {
  validateRequestCookies,
} from "../../../middlewares/validateRequest";
import { RydrOnboardingValidation } from "./driver.onboarding.validation";
import { RydrOnboardingControllers } from "./driver.onboarding.controller";
import protect from "../../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  validateRequest(RydrOnboardingValidation.onboardingValidationSchema),
  RydrOnboardingControllers.onboarding,
);

router.post(
  "/verify-phone-otp",
  validateRequest(RydrOnboardingValidation.verifyPhoneOTPValidationSchema),
  RydrOnboardingControllers.verifyPhoneOTP,
);

router.post(
  "/resend-phone-otp",
  validateRequest(RydrOnboardingValidation.resendPhoneOTPValidationSchema),
  RydrOnboardingControllers.resendPhoneOTP,
);

router.post(
  "/complete-onboarding",
  validateRequest(RydrOnboardingValidation.completeOnboardingValidationSchema),
  protect("USER"),
  RydrOnboardingControllers.completeOnboarding,
);

router.post(
  "/refresh-token",
  validateRequestCookies(RydrOnboardingValidation.refreshTokenValidationSchema),
  RydrOnboardingControllers.refreshToken,
);

router.post(
  "/logout",
  validateRequestCookies(RydrOnboardingValidation.refreshTokenValidationSchema),
  RydrOnboardingControllers.logout,
);

export const DriverOnboardingRoutes = router;
