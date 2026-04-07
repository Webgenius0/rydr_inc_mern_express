/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import config from "../../config";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import { catchAsync } from "../../utils/catchAsync";
import { generateOTP } from "../../utils/authHelper";
import { Request, Response, CookieOptions } from "express";
import { emailHelper } from "../../utils/emailHelper";
import { otpEmailTemplate } from "../../../views/email.views";
import AppError from "../../errors/AppError";

// cookie options used throughout auth endpoints. need same options when
// clearing; mismatched sameSite value was preventing logout cookies from
// being removed in cross‑site scenarios. the frontend must also send
// credentials (fetch/axios with `credentials: 'include'` or
// `withCredentials: true`).
const cookieOptions: CookieOptions = {
  // secure: true,
  secure: config.NODE_ENV === "production",
  httpOnly: true,
  sameSite: config.NODE_ENV === "production" ? "none" : "lax",
};

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const otp = generateOTP();
  const payload = {
    ...body,
    otp,
    otpExpiresAt: new Date(
      Date.now() + config.email_otp_expiration_minutes * 60 * 1000,
    ),
  };
  const { refreshToken, accessToken, newUser } =
    await AuthServices.registerUser(payload);

  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.cookie("accessToken", accessToken, cookieOptions);

  // Send Otp to user
  const html = otpEmailTemplate({
    title: "Verify Your Email",
    otp,
    name: newUser.name,
    expiresMinutes: config.email_otp_expiration_minutes,
    footer: "Fedicycle Security Team",
  });

  const result = await emailHelper({
    to: newUser.email,
    subject: "🔐 Verify Your Email - Fedicycle",
    message: `Your email verification OTP is ${otp}. It will expire in ${config.email_otp_expiration_minutes} minutes.`,
    html,
  });

  if (result.accepted && result.accepted.length > 0) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        "An OTP has been sent to your email for verification. Please check your inbox.",
      data: {
        accessToken,
        refreshToken,
      },
    });
  }
});
const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const { otp, email } = req.body;
  const result = await AuthServices.verifyOTP(otp, email);
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

  const otp = generateOTP();
  const otpExpiresAt = new Date(
    Date.now() + config.email_otp_expiration_minutes * 60 * 1000,
  );

  const user = await AuthServices.updateUserOtp(email, {
    otp,
    otpExpiresAt,
  });

  const html = otpEmailTemplate({
    title: "Resend Verification Code",
    otp,
    name: user?.name as string,
    expiresMinutes: config.email_otp_expiration_minutes,
    footer: "Fedicycle Security Team",
  });

  const result = await emailHelper({
    to: user?.email as string,
    subject: "🔐 Resend OTP - Fedicycle",
    message: `Your new verification OTP is ${otp}. It will expire in ${config.email_otp_expiration_minutes} minutes.`,
    html,
  });

  if (result.accepted && result.accepted.length > 0) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        "A new OTP has been sent to your email. Please check your inbox.",
      data: null,
    });
  }
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const otp = generateOTP();
  const { user } = await AuthServices.forgotPassword(email, otp);

  const html = otpEmailTemplate({
    title: "Reset Your Password",
    otp,
    name: user?.name,
    expiresMinutes: config.email_otp_expiration_minutes,
  });

  await emailHelper({
    to: email,
    subject: "🔐 Reset Password OTP - Fedicycle",
    html,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP sent to your email. (Field added dynamically)",
    data: null,
  });
});

const forgotPasswordVerifyOTP = catchAsync(
  async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `${!email ? "Email" : "OTP"} is required`,
      );
    }
    const { resetToken } = await AuthServices.forgotPasswordVerifyOTP(
      otp,
      email,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "OTP verified. Reset token set in cookie.",
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

export const AuthControllers = {
  registerUser,
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
