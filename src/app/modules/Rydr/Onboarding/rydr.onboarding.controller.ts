/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import config from "../../../config";
import sendResponse from "../../../utils/sendResponse";
import { AuthServices } from "./rydr.onboarding.service";
import { catchAsync } from "../../../utils/catchAsync";
import { generateOTP } from "../../../utils/authHelper";
import { Request, Response, CookieOptions } from "express";
import { emailHelper } from "../../../utils/emailHelper";
import { otpEmailTemplate } from "../../../../views/email.views";
import AppError from "../../../errors/AppError";
 
const cookieOptions: CookieOptions = {
  // secure: true,
  secure: config.NODE_ENV === "production",
  httpOnly: true,
  sameSite: config.NODE_ENV === "production" ? "none" : "lax",
};

const rydrOnboarding = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const phone_otp = generateOTP();
  const payload = {
    ...body,
    phone_otp,
    otpExpiresAt: new Date(
      Date.now() + config.email_otp_expiration_minutes * 60 * 1000,
    ),
  };
  const { refreshToken, accessToken, user } = await AuthServices.rydrOnboarding(payload);

  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.cookie("accessToken", accessToken, cookieOptions);

  // Send email_otp to user
  const html = otpEmailTemplate({
    title: "Verify Your Email",
    email_otp,
    name: user.name,
    expiresMinutes: config.email_otp_expiration_minutes,
    footer: "Fedicycle Security Team",
  });

  const result = await emailHelper({
    to: user.email,
    subject: "🔐 Verify Your Email - Fedicycle",
    message: `Your email verification email_otp is ${email_otp}. It will expire in ${config.email_otp_expiration_minutes} minutes.`,
    html,
  });

  if (result.accepted && result.accepted.length > 0) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        "An email_otp has been sent to your email for verification. Please check your inbox.",
      data: {
        accessToken,
        refreshToken,
      },
    });
  }
});
const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const { email_otp, email } = req.body;
  const result = await AuthServices.verifyOTP(email_otp, email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Email verified successfully!",
    data: result,
  });
});
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);
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

  const user = await AuthServices.updateUserOtp(email, {
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
  const { user } = await AuthServices.forgotPassword(email, email_otp);

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
    const { resetToken } = await AuthServices.forgotPasswordVerifyOTP(
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

  await AuthServices.resetPassword(resetToken, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successful!",
    data: null,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { ...passwordData } = req.body;

  const result = await AuthServices.changePassword(req.user, passwordData);
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
  const result = await AuthServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token retrieved successfully!",
    data: result,
  });
});

export const RydrOnboardingControllers = {
  rydrOnboarding,
  verifyOTP,
  resendOtp,
  loginUser,
  forgotPassword,
  forgotPasswordVerifyOTP,
  resetPassword,
  changePassword,
  logout,
  refreshToken,
};
