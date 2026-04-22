import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../../config";
import AppError from "../../../errors/AppError";

import { USER_ROLE } from "../../User/user.constant";

import { User } from "../../User/user.model";

import { getOTPExpiryDate } from "../../../utils/dateHelper";
import {
  TRydrCompleteOnboarding,
  TRydrOnboarding,
  TRydrVerifyPhoneOTP,
} from "./rydr.onboarding.interface";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../User/user.utils";
import { generateOTP } from "../../../utils/authHelper";

const rydrOnboarding = async (payload: TRydrOnboarding) => {
  // checking if the user is exist
  // create token and sent to the  client

  const user = await User.findOne({ phone: payload.phone });

  if (user && user.role !== USER_ROLE.DRIVER) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already an driver account with this phone number! For user account choose another phone number.",
    );
  }

  if (user) {
    if (!user.phone || !user.language) {
      throw new Error("Missing required user fields for token");
    }
    await user.save();

    if (user.role !== USER_ROLE.USER) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You already have an account with this phone number! For rydr account choose another phone number.",
      );
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

const rydrVerifyOnboardingPhoneOTP = async (payload: TRydrVerifyPhoneOTP) => {
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

const rydrResendPhoneOTP = async (phone: string) => {
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
  payload: TRydrCompleteOnboarding,
) => {
  const {
    first_name,
    last_name,
    email,
    agreed_terms_and_conditions,
    current_location,
  } = payload;

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  user.first_name = first_name;
  user.last_name = last_name;
  user.email = email;
  user.agreed_terms_and_conditions = agreed_terms_and_conditions;
  user.current_location = current_location;

  await user.save();

  return {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    agreed_terms_and_conditions: user.agreed_terms_and_conditions,
    current_location: user.current_location,
  };
};

const refreshToken = async (token: string) => {
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(
      token,
      config.jwt_refresh_secret as string,
    ) as JwtPayload;
  } catch (err) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token!");
  }

  const { id, phone } = decoded;

  const user = await User.findOne({
    $or: [{ phone: phone }, { _id: id }],
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  const userStatus = user?.status;

  if (userStatus === "BLOCKED") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked!");
  }

  if (user.refreshToken !== token) {
    throw new AppError(httpStatus.FORBIDDEN, "Refresh token not valid!");
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
  rydrOnboarding,
  rydrVerifyOnboardingPhoneOTP,
  rydrResendPhoneOTP,
  completeOnboarding,
  refreshToken,
};
