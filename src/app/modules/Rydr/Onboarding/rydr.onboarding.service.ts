/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../../../config";
import AppError from "../../../errors/AppError";

import { USER_ROLE } from "../../User/user.constant";

import { User } from "../../User/user.model";

import { getOTPExpiryDate } from "../../../utils/dateHelper";
import crypto from "crypto";
import { TRydrOnboarding } from "./rydr.onboarding.interface";
import { generateToken } from "../../User/user.utils";
import { generateOTP } from "../../../utils/authHelper";

const rydrOnboarding = async (payload: TRydrOnboarding) => {
  // checking if the user is exist
  // create token and sent to the  client

  const user = await User.findOne({ phone: payload.phone });

  if (user) {
    if (!user.phone || !user.country || !user.language) {
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

const rydrVerifyOnboardingPhoneOTP = async (payload: TRydrOnboarding) => {
  // checking if the user is exist
  //create token and sent to the  client

  const user = await User.findOne({ phone: payload.phone });

  if (user) {
    if (!user.phone || !user.country || !user.language) {
      throw new Error("Missing required user fields for token");
    }
    const accessToken = generateToken(
      {
        phone: user.phone,
        country: user.country,
        language: user.language,
        role: user.role,
      },
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string,
    );
    const refreshToken = generateToken(
      {
        phone: user.phone,
        country: user.country,
        language: user.language,
        role: user.role,
      },
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string,
    );
    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken, user };
  }

  payload.role = USER_ROLE.USER;

  //create new user
  const newUser = await User.create(payload);

  if (!newUser.phone || !newUser.country || !newUser.language) {
    throw new Error("Missing required user fields for token");
  }

  const accessToken = generateToken(
    {
      phone: newUser.phone,
      country: newUser.country,
      language: newUser.language,
      role: newUser.role,
    },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  const refreshToken = generateToken(
    {
      phone: newUser.phone,
      country: newUser.country,
      language: newUser.language,
      role: newUser.role,
    },
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  newUser.refreshToken = refreshToken;
  await newUser.save();

  return {
    accessToken,
    refreshToken,
    user: newUser,
  };
};

const verifyOTP = async (email_otp: string, email: string) => {
  const user = await User.findOne({ email });
  if (!user || !user.email_otp) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User not found or no email_otp requested!",
    );
  }

  const isOtpValid = user.email_otp === email_otp;
  const isNotExpired = new Date(user.otpExpiresAt as Date) > new Date();

  if (!isOtpValid) {
    throw new AppError(400, "Invalid email_otp");
  }

  if (!isNotExpired) {
    throw new AppError(400, "email_otp has expired");
  }

  const verifiedAt = new Date();

  await User.findOneAndUpdate(
    { email },
    {
      $unset: { email_otp: 1, otpExpiresAt: 1 },
      $set: { isVerified: true },
      $push: {
        activityLogs: createUserActivityPush(
          createUserActivity("ACCOUNT_VERIFIED", verifiedAt),
        ),
      },
    },
  );
  return null;
};
const updateUserOtp = async (
  email: string,
  payload: { email_otp: string; otpExpiresAt: Date },
) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found with this email");
  }

  const updatedUser = await User.findOneAndUpdate(
    { email },
    {
      $set: payload,
    },
    { new: true },
  );

  return updatedUser;
};

// const loginUser = async (payload: ) => {
//   // checking if the user is exist
//   const user = await User.isUserExistsByEmail(payload?.email);

//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, "This user is not found!");
//   }

//   // checking if the user is blocked

//   const userStatus = user?.status;

//   if (userStatus === "BLOCKED") {
//     throw new AppError(httpStatus.FORBIDDEN, "This user is blocked!");
//   }

//   //checking if the password is correct

//   if (!(await User.isPasswordMatched(payload?.password, user?.password)))
//     throw new AppError(httpStatus.FORBIDDEN, "Password do not matched");

//   //create token and sent to the  client

//   const jwtPayload = {
//     _id: user._id,
//     name: user.name,
//     email: user.email,
//     mobileNumber: user.mobileNumber,
//     role: user.role,
//     status: user.status,
//   };

//   const accessToken = createToken(
//     jwtPayload,
//     config.jwt_access_secret as string,
//     config.jwt_access_expires_in as string,
//   );

//   const refreshToken = createToken(
//     jwtPayload,
//     config.jwt_refresh_secret as string,
//     config.jwt_refresh_expires_in as string,
//   );

//   const loginAt = new Date();

//   await User.findByIdAndUpdate(user._id, {
//     $set: { lastLoginAt: loginAt },
//     $push: {
//       activityLogs: createUserActivityPush(
//         createUserActivity("LAST_LOGIN", loginAt),
//       ),
//     },
//   });

//   return {
//     accessToken,
//     refreshToken,
//   };
// };

const forgotPassword = async (email: string, email_otp: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (
    user.email_otp &&
    user.otpExpiresAt &&
    new Date() < new Date(user.otpExpiresAt)
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "An email_otp has already been sent. Please wait until it expires or check your email.",
    );
  }
  const otpExpiresAt = getOTPExpiryDate(
    Number(config.email_otp_expiration_minutes),
  );

  const updatedUser = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        email_otp: email_otp,
        otpExpiresAt: otpExpiresAt,
      },
    },
    {
      new: true,
      runValidators: false,
      strict: false,
    },
  );

  return { user: updatedUser };
};

const forgotPasswordVerifyOTP = async (email_otp: string, email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const userOtp = (user as any).email_otp;
  const userOtpExpiresAt = (user as any).otpExpiresAt;

  if (
    !userOtp ||
    userOtp !== email_otp ||
    new Date() > new Date(userOtpExpiresAt)
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid or expired email_otp");
  }
  const resetToken = (user as any).createPasswordResetToken();
  (user as any).email_otp = undefined;
  (user as any).otpExpiresAt = undefined;

  await user.save({ validateBeforeSave: false });
  return { resetToken };
};

const resetPassword = async (resetToken: string, newPassword: string) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Invalid Token or Token has been expired",
    );
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds),
  );
  const passwordChangedAt = new Date();

  const updatedUser = await User.findOneAndUpdate(
    { email: user?.email },
    {
      $set: { password: hashedPassword, passwordChangedAt },
      $unset: { passwordResetExpires: 1, passwordResetToken: 1 },
      $push: {
        activityLogs: createUserActivityPush(
          createUserActivity("PASSWORD_CHANGED", passwordChangedAt),
        ),
      },
    },
    { new: true, strict: false },
  );

  return updatedUser!;
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(userData.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  // checking if the user is blocked

  const userStatus = user?.status;

  if (userStatus === "BLOCKED") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked!");
  }

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload.oldPassword, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, "Password do not matched");

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );
  const passwordChangedAt = new Date();

  await User.findOneAndUpdate(
    {
      email: userData.email,
      role: userData.role,
    },
    {
      $set: {
        password: newHashedPassword,
        passwordChangedAt,
      },
      $push: {
        activityLogs: createUserActivityPush(
          createUserActivity("PASSWORD_CHANGED", passwordChangedAt),
        ),
      },
    },
  );

  return null;
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = jwt.verify(
    token,
    config.jwt_refresh_secret as string,
  ) as JwtPayload;

  const { email, iat } = decoded;

  // checking if the user is exist
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === "BLOCKED") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked!");
  }

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized !");
  }

  const jwtPayload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};

export const OnboardingServices = {
  rydrOnboarding,
  rydrVerifyOnboardingPhoneOTP,
};
