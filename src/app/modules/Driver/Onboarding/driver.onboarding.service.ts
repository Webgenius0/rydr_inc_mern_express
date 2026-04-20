import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../../config";
import AppError from "../../../errors/AppError";

import { USER_ROLE } from "../../User/user.constant";

import { User } from "../../User/user.model";

import { getOTPExpiryDate } from "../../../utils/dateHelper";
import {
  TDriverCompleteOnboarding,
  TDriverOnboarding,
  TDriverVerifyPhoneOTP,
} from "./driver.onboarding.interface";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../User/user.utils";
import { generateOTP } from "../../../utils/authHelper";

const onboarding = async (payload: TDriverOnboarding) => {
  // checking if the user is exist
  // create token and sent to the  client

  const user = await User.findOne({ phone: payload.phone });

  if (user?.role !== USER_ROLE.DRIVER) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already an account with this phone number! For driver account choose another phone number.",
    );
  }

  if (user) {
    if (!user.phone || !user.language) {
      throw new Error("Missing required user fields for token");
    }
    const otp = generateOTP();
    const otpExpiresAt = getOTPExpiryDate(
      Number(config.email_otp_expiration_minutes),
    );
    user.phone_otp = otp;
    user.phone_otp_expires_at = otpExpiresAt;
    await user.save();

    return { user, otp, phone_otp_expires_at: otpExpiresAt };
  }

  //create new user
  const newUser = await User.create(payload);
  newUser.role = USER_ROLE.USER;
  await newUser.save();

  const otp = generateOTP();
  const otpExpiresAt = getOTPExpiryDate(
    Number(config.email_otp_expiration_minutes),
  );
  newUser.phone_otp = otp;
  newUser.phone_otp_expires_at = otpExpiresAt;
  await newUser.save();

  return { user, otp, phone_otp_expires_at: otpExpiresAt };
};

const verifyOnboardingPhoneOTP = async (payload: TDriverVerifyPhoneOTP) => {
  const result = await User.find({ phone: payload.phone });
  const user = result[0];

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (
    user.phone_otp_expires_at &&
    new Date() > new Date(user.phone_otp_expires_at)
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "OTP has expired!");
  }

  if (user.phone_otp !== payload.otp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Phone number or OTP does not match!",
    );
  }

  user.phone_otp = undefined;
  user.phone_otp_expires_at = undefined;
  await user.save();

  if (!user.phone || !user.language) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please complete your profile first!",
    );
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken, user };
};

const resendPhoneOTP = async (phone: string) => {
  const user = await User.findOne({ phone });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  const otp = generateOTP();
  const otpExpiresAt = getOTPExpiryDate(
    Number(config.email_otp_expiration_minutes),
  );
  user.phone_otp = otp;
  user.phone_otp_expires_at = otpExpiresAt;
  await user.save();

  return { otp, phone_otp_expires_at: otpExpiresAt };
};

const completeOnboarding = async (
  userId: string,
  payload: TDriverCompleteOnboarding,
) => {
  const {
    first_name,
    last_name,
    email,
    agreed_terms_and_conditions,
    currentLocation,
  } = payload;

  const user = await User.findById(userId);
  console.log({ user });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  user.first_name = first_name;
  user.last_name = last_name;
  user.email = email;
  user.agreed_terms_and_conditions = agreed_terms_and_conditions;
  user.currentLocation = currentLocation;

  await user.save();

  return {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    agreed_terms_and_conditions: user.agreed_terms_and_conditions,
    currentLocation: user.currentLocation,
  };
};

const refreshToken = async (token: string) => {
  const decoded = jwt.verify(
    token,
    config.jwt_refresh_secret as string,
  ) as JwtPayload;

  const { id, phone } = decoded;

  const user = await User.findOne({
    $or: [{ email: phone }, { phone: phone }, { _id: id }],
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  const userStatus = user?.status;

  if (userStatus === "BLOCKED") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked!");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
  };
};

export const RydrOnboardingServices = {
  onboarding,
  verifyOnboardingPhoneOTP,
  resendPhoneOTP,
  completeOnboarding,
  refreshToken,
};
