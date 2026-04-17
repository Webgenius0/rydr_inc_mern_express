/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import config from "../../../config";
import sendResponse from "../../../utils/sendResponse";
import { OnboardingServices } from "./rydr.onboarding.service";
import { catchAsync } from "../../../utils/catchAsync";
import { generateOTP } from "../../../utils/authHelper";
import { Request, Response, CookieOptions } from "express";
import { emailHelper } from "../../../utils/emailHelper";
import { otpEmailTemplate } from "../../../../views/email.views";
import AppError from "../../../errors/AppError";
import { ca } from "zod/v4/locales";

const cookieOptions: CookieOptions = {
  // secure: true,
  secure: config.NODE_ENV === "production",
  httpOnly: true,
  sameSite: config.NODE_ENV === "production" ? "none" : "lax",
};

const rydrOnboarding = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;

  const { otp, phone_otp_expires_at } =
    await OnboardingServices.rydrOnboarding(body);

  //TODO Send phone_otp to user via SMS (integration with SMS provider needed)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "A 6-digit verification code has been sent to your phone.",
    data: {
      otp,
      phone_otp_expires_at,
    },
  });
});
const verifyPhoneOTP = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await OnboardingServices.rydrVerifyOnboardingPhoneOTP(payload);

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP verification failed");
  }

  const { accessToken, refreshToken, user } = result;

  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.cookie("accessToken", accessToken, cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Phone verified successfully!",
    data: { accessToken, refreshToken, user },
  });
});

const resendPhoneOTP = catchAsync(async (req: Request, res: Response) => {
  const { phone } = req.body;

  const result = await OnboardingServices.rydrResendPhoneOTP(phone);

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "Failed to resend OTP");
  }

  const { otp, phone_otp_expires_at } = result;

  //TODO Send phone_otp to user via SMS (integration with SMS provider needed)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "A new verification code has been sent to your phone.",
    data: {
      otp,
      phone_otp_expires_at,
    },
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await OnboardingServices.loginUser(req.body);
  const { refreshToken, accessToken } = result;

  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.cookie("accessToken", accessToken, cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully!",
    data: {
      accessToken,
      refreshToken,
    },
  });
});

const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  const email_otp = generateOTP();
  const otpExpiresAt = new Date(
    Date.now() + config.email_otp_expiration_minutes * 60 * 1000,
  );

  const user = await OnboardingServices.updateUserOtp(email, {
    email_otp,
    otpExpiresAt,
  });

  const html = otpEmailTemplate({
    title: "Resend Verification Code",
    email_otp,
    name: user?.name as string,
    expiresMinutes: config.email_otp_expiration_minutes,
    footer: "Fedicycle Security Team",
  });

  const result = await emailHelper({
    to: user?.email as string,
    subject: "🔐 Resend email_otp - Fedicycle",
    message: `Your new verification email_otp is ${email_otp}. It will expire in ${config.email_otp_expiration_minutes} minutes.`,
    html,
  });

  if (result.accepted && result.accepted.length > 0) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        "A new email_otp has been sent to your email. Please check your inbox.",
      data: null,
    });
  }
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const email_otp = generateOTP();
  const { user } = await OnboardingServices.forgotPassword(email, email_otp);

  const html = otpEmailTemplate({
    title: "Reset Your Password",
    email_otp,
    name: user?.name,
    expiresMinutes: config.email_otp_expiration_minutes,
  });

  await emailHelper({
    to: email,
    subject: "🔐 Reset Password email_otp - Fedicycle",
    html,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "email_otp sent to your email. (Field added dynamically)",
    data: null,
  });
});

const forgotPasswordVerifyOTP = catchAsync(
  async (req: Request, res: Response) => {
    const { email, email_otp } = req.body;
    if (!email || !email_otp) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `${!email ? "Email" : "email_otp"} is required`,
      );
    }
    const { resetToken } = await OnboardingServices.forgotPasswordVerifyOTP(
      email_otp,
      email,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "email_otp verified. Reset token set in cookie.",
      data: { resetToken },
    });
  },
);

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { newPassword, resetToken } = req.body;

  if (!resetToken) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Reset session expired or invalid",
    );
  }

  await OnboardingServices.resetPassword(resetToken, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successful!",
    data: null,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { ...passwordData } = req.body;

  const result = await OnboardingServices.changePassword(
    req.user,
    passwordData,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password updated successfully!",
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  // clear cookies with the exact same options used when they were set
  res.clearCookie("refreshToken", cookieOptions);
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("resetToken", cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged out successfully!",
    data: null,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  const result = await OnboardingServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token retrieved successfully!",
    data: result,
  });
});

export const RydrOnboardingControllers = {
  rydrOnboarding,
  verifyPhoneOTP,
  resendPhoneOTP,
};
