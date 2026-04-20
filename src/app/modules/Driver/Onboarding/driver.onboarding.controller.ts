/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import config from "../../../config";
import sendResponse from "../../../utils/sendResponse";
import { RydrOnboardingServices } from "./driver.onboarding.service";
import { catchAsync } from "../../../utils/catchAsync";
import { Request, Response, CookieOptions } from "express";
import AppError from "../../../errors/AppError";

const cookieOptions: CookieOptions = {
  // secure: true,
  secure: config.NODE_ENV === "production",
  httpOnly: true,
  sameSite: config.NODE_ENV === "production" ? "none" : "lax",
};

const onboarding = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;

  const { otp, phone_otp_expires_at } =
    await RydrOnboardingServices.onboarding(body);

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

  const result =
    await RydrOnboardingServices.verifyOnboardingPhoneOTP(payload);

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP verification failed");
  }

  const { accessToken, refreshToken, user } = result;

  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.cookie("accessToken", accessToken, cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: !user.first_name
      ? "Verified! Please complete your Onboarding."
      : "Phone otp verified successfully!",
    data: { accessToken, refreshToken },
  });
});

const resendPhoneOTP = catchAsync(async (req: Request, res: Response) => {
  const { phone } = req.body;

  const result = await RydrOnboardingServices.resendPhoneOTP(phone);

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

const completeOnboarding = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await RydrOnboardingServices.completeOnboarding(
    req.user.id,
    payload,
  );

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "Failed to complete onboarding");
  }

  //TODO Send phone_otp to user via SMS (integration with SMS provider needed)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Onboarding completed successfully!",
    data: result,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.cookies;
  const result = await RydrOnboardingServices.refreshToken(token);

  res.cookie("refreshToken", token, cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Access token retrieved successfully!",
    data: result,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  // clear cookies with the exact same options used when they were set
  res.clearCookie("refreshToken", cookieOptions);
  res.clearCookie("accessToken", cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged out successfully!",
    data: null,
  });
});

export const RydrOnboardingControllers = {
  onboarding,
  verifyPhoneOTP,
  resendPhoneOTP,
  completeOnboarding,
  refreshToken,
  logout,
};
