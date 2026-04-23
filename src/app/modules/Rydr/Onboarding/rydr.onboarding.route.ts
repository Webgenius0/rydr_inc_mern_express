import express from "express";

import validateRequest, {
  validateRequestCookies,
} from "../../../middlewares/validateRequest";
import { RydrOnboardingValidation } from "./rydr.onboarding.validation";
import { RydrOnboardingControllers } from "./rydr.onboarding.controller";
import protect from "../../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  validateRequest(RydrOnboardingValidation.rydrOnboardingValidationSchema),
  RydrOnboardingControllers.rydrOnboarding,
);

router.post(
  "/verify-phone-otp",
  validateRequest(RydrOnboardingValidation.rydrVerifyPhoneOTPValidationSchema),
  RydrOnboardingControllers.verifyPhoneOTP,
);

router.post(
  "/resend-phone-otp",
  validateRequest(RydrOnboardingValidation.rydrResendPhoneOTPValidationSchema),
  RydrOnboardingControllers.resendPhoneOTP,
);

router.post(
  "/complete-onboarding",
  validateRequest(
    RydrOnboardingValidation.rydrCompleteOnboardingValidationSchema,
  ),
  protect("USER"),
  RydrOnboardingControllers.completeOnboarding,
);

router.post(
  "/refresh-token",
  validateRequestCookies(
    RydrOnboardingValidation.rydrRefreshTokenValidationSchema,
  ),
  RydrOnboardingControllers.refreshToken,
);

router.post(
  "/logout",
  validateRequestCookies(
    RydrOnboardingValidation.rydrRefreshTokenValidationSchema,
  ),
  RydrOnboardingControllers.logout,
);
export const RydrOnboardingRoutes = router;

