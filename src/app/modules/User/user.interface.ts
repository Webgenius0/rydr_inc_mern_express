/* eslint-disable no-unused-vars */
import { Model } from "mongoose";
import { USER_ROLE, USER_STATUS } from "./user.constant";

export type TUserActivityType =
  | "ACCOUNT_CREATED"
  | "PROFILE_UPDATED"
  | "PASSWORD_CHANGED"
  | "ACCOUNT_VERIFIED"
  | "STATUS_UPDATED"
  | "LAST_LOGIN";

export type TUserActivityItem = {
  id: string;
  type: TUserActivityType;
  title: string;
  description: string;
  timestamp: Date;
};

export type TUser = {
  _id?: string;
  name: string;
  role: keyof typeof USER_ROLE;
  email: string;
  password: string;
  status: keyof typeof USER_STATUS;
  isVerified: boolean;
  passwordChangedAt?: Date;
  mobileNumber?: string;
  profilePhoto?: string;
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  activityLogs?: TUserActivityItem[];
  otp?: string;
  otpExpiresAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
};

export type TUserListQuery = {
  page?: number;
  limit?: number;
  searchTerm?: string;
  role?: keyof typeof USER_ROLE | "ALL";
  status?: keyof typeof USER_STATUS | "ALL";
  isVerified?: boolean | "ALL";
  created?:
    | "ALL"
    | "TODAY"
    | "YESTERDAY"
    | "LAST_7_DAYS"
    | "THIS_MONTH"
    | "CUSTOM";
  createdFrom?: string;
  createdTo?: string;
  sort?: string;
  sortBy?: string;
};

export type TPaginationMeta = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type TUserListItem = {
  _id: string;
  displayId: string;
  initials: string;
  name: string;
  email: string;
  role: keyof typeof USER_ROLE;
  status: keyof typeof USER_STATUS;
  isVerified: boolean;
  mobileNumber: string | null;
  profilePhoto: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type TPaginatedUsers = {
  items: TUserListItem[];
  meta: TPaginationMeta;
};

export type TUserStatusUpdateResponse = {
  _id: string;
  name: string;
  email: string;
  status: keyof typeof USER_STATUS;
  updatedAt: Date | null;
};

export type TUserDetail = {
  summary: {
    _id: string;
    displayId: string;
    initials: string;
    name: string;
    email: string;
    role: keyof typeof USER_ROLE;
    status: keyof typeof USER_STATUS;
    isVerified: boolean;
    profilePhoto: string | null;
    joinedAt: Date | null;
    lastUpdatedAt: Date | null;
    lastLoginAt: Date | null;
    lastActivityAt: Date | null;
  };
  metrics: {
    accountAgeInDays: number;
    totalActivities: number;
    lastActivityAt: Date | null;
  };
  profileInformation: {
    fullName: string;
    emailAddress: string;
    userRole: keyof typeof USER_ROLE;
    accountStatus: keyof typeof USER_STATUS;
    verified: boolean;
    mobileNumber: string | null;
    profilePhoto: string | null;
  };
  addressInformation: {
    address: string | null;
  };
};

export type TPaginatedUserActivity = {
  items: TUserActivityItem[];
  meta: TPaginationMeta;
};

export interface IUserModel extends Model<TUser> {
  isUserExistsByEmail(id: string): Promise<TUser>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}

export interface UpdateUserProfilePayload {
  name?: string;
  email?: string;
  mobileNumber?: string;
  profilePhoto?: string | null;
  address?: string;
}
