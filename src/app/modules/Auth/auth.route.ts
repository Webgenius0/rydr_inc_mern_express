import express from "express";
import auth from "../../middlewares/auth";
import validateRequest, {
  validateRequestCookies,
} from "../../middlewares/validateRequest";
import { USER_ROLE } from "../User/user.constant";
import { AuthControllers } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = express.Router();

router.post(
  "/register",
  validateRequest(AuthValidation.registerValidationSchema),
  AuthControllers.registerUser,
);
router.post(
  "/verify-otp",
  validateRequest(AuthValidation.verifyOTPValidationSchema),
  AuthControllers.verifyOTP,
);
router.post(
  "/resend-otp",
  validateRequest(AuthValidation.resendOtpValidationSchema),
  AuthControllers.resendOtp,
);
router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthControllers.loginUser,
);

// now get token then you can access this route
router.post(
  "/forgot-password",
  validateRequest(AuthValidation.resendOtpValidationSchema),
  AuthControllers.forgotPassword,
);
router.post(
  "/forgot-password-verify-otp",
  validateRequest(AuthValidation.verifyOTPValidationSchema),
  AuthControllers.forgotPasswordVerifyOTP,
);
router.post(
  "/reset-password",
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthControllers.resetPassword,
);

router.post(
  "/change-password",
  auth(USER_ROLE.CUSTOMER, USER_ROLE.SELLER),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthControllers.changePassword,
);
// logout endpoint doesn't need a valid access token; clearing the
// cookies should always be allowed (client might be calling after the
// token has already expired).
router.post("/logout", AuthControllers.logout);

router.post(
  "/refresh-token",
  validateRequestCookies(AuthValidation.refreshTokenValidationSchema),
  AuthControllers.refreshToken,
);

export const AuthRoutes = router;
