/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { FilterQuery, Types } from "mongoose";
import AppError from "../../errors/AppError";
import { UserSearchableFields } from "./user.constant";
import {
  TPaginatedUserActivity,
  TPaginatedUsers,
  TUser,
  TUserActivityItem,
  TUserDetail,
  TUserListQuery,
  TUserListItem,
  TUserStatusUpdateResponse,
} from "./user.interface";
import { User } from "./user.model";
import { createUserActivity, createUserActivityPush } from "./user.activity";
import { uploadBufferToCloudinary } from "../../utils/cloudinary.service";
import { deleteImageByUrl } from "../../shared/upload/deleteImage";
type TUserRecord = TUser & {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

const SAFE_USER_SELECT =
  "-__v -email_otp -otpExpiresAt -passwordResetToken -passwordResetExpires";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DISPLAY_ID_REGEX = /^usr_(\d+)$/i;

const createUser = async (payload: TUser) => {
  const user = await User.create(payload);
  return user;
};

const parsePositiveNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
};

const normalizeString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const toBoolean = (value: unknown) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }

  return undefined;
};

const isAllFilter = (value: unknown) =>
  normalizeString(value).toUpperCase() === "ALL";

const getDayRange = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const toDate = (value: unknown) => {
  const rawValue = normalizeString(value);

  if (!rawValue) {
    return null;
  }

  const parsed = new Date(rawValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const mapCreatedFilter = (value: unknown): string => {
  const raw = normalizeString(value).toUpperCase();
  const mapping: Record<string, string> = {
    TODAY: "TODAY",
    YESTERDAY: "YESTERDAY",
    LAST7DAYS: "LAST_7_DAYS",
    LAST_7_DAYS: "LAST_7_DAYS",
    THISMONTH: "THIS_MONTH",
    THIS_MONTH: "THIS_MONTH",
    CUSTOM: "CUSTOM",
    ALL: "ALL",
  };
  return mapping[raw] ?? "";
};

const buildUserFilters = async (query: TUserListQuery) => {
  const filter: FilterQuery<TUserRecord> = {};
  const searchTerm = normalizeString(query.searchTerm);
  const role =
    typeof query.role === "string" && !isAllFilter(query.role)
      ? query.role
      : undefined;
  const status =
    typeof query.status === "string" && !isAllFilter(query.status)
      ? query.status
      : undefined;
  const isVerified = toBoolean(query.isVerified);
  const createdFilter = mapCreatedFilter(query.created);
  const createdFrom = toDate(query.createdFrom);
  const createdTo = toDate(query.createdTo);

  if (searchTerm) {
    const displayIdMatch = searchTerm.match(DISPLAY_ID_REGEX);

    if (displayIdMatch) {
      const sequence = Number(displayIdMatch[1]);
      const user = await User.findOne()
        .sort({ createdAt: 1, _id: 1 })
        .skip(Math.max(0, sequence - 1))
        .select("_id")
        .lean<{ _id: Types.ObjectId } | null>();

      filter._id = user?._id ?? new Types.ObjectId();
    } else {
      filter.$or = UserSearchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      }));
    }
  }

  if (role) {
    filter.role = role;
  }

  if (status) {
    filter.status = status;
  }

  if (typeof isVerified === "boolean") {
    filter.isVerified = isVerified;
  }

  if (createdFilter === "CUSTOM" && (createdFrom || createdTo)) {
    const rangeStart = createdFrom ?? new Date(0);
    const rangeEnd = createdTo ?? new Date();
    rangeEnd.setHours(23, 59, 59, 999);

    filter.createdAt = {
      $gte: rangeStart,
      $lte: rangeEnd,
    };
  } else if (createdFilter && createdFilter !== "ALL") {
    const now = new Date();

    if (createdFilter === "TODAY") {
      const { start, end } = getDayRange(now);
      filter.createdAt = { $gte: start, $lte: end };
    }

    if (createdFilter === "YESTERDAY") {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const { start, end } = getDayRange(yesterday);
      filter.createdAt = { $gte: start, $lte: end };
    }

    if (createdFilter === "LAST_7_DAYS") {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      filter.createdAt = { $gte: start, $lte: now };
    }

    if (createdFilter === "THIS_MONTH") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }
  }

  return filter;
};

const getSortClause = (query: Record<string, unknown>) => {
  const sortValue = normalizeString(query.sort).toLowerCase();

  if (sortValue === "oldest_created" || sortValue === "oldest(created)") {
    return "createdAt";
  }

  if (sortValue === "name_asc") {
    return "name";
  }

  if (sortValue === "name_desc") {
    return "-name";
  }

  if (sortValue === "last_updated") {
    return "-updatedAt";
  }

  return typeof query.sortBy === "string" ? query.sortBy : "-createdAt";
};

const getInitials = (name: string) => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const getAccountAgeInDays = (createdAt?: Date) => {
  if (!createdAt) {
    return 0;
  }

  const diffInMs = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(diffInMs / (1000 * 60 * 60 * 24)));
};

const formatDisplayId = (sequence: number) =>
  `usr_${String(sequence).padStart(4, "0")}`;

const getUserSequence = async (user: TUserRecord) => {
  const createdAt = user.createdAt ?? new Date(0);

  const count = await User.countDocuments({
    $or: [
      { createdAt: { $lt: createdAt } },
      {
        createdAt,
        _id: { $lte: user._id },
      },
    ],
  });

  return count;
};

const formatUserListItem = async (
  user: TUserRecord,
): Promise<TUserListItem> => {
  const sequence = await getUserSequence(user);

  return {
    _id: user._id.toString(),
    displayId: formatDisplayId(sequence),
    initials: getInitials(user.name),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    isVerified: user.isVerified,
    mobileNumber: user.mobileNumber ?? null,
    profilePhoto: user.profilePhoto ?? null,
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
  };
};

const buildActivityLog = (user: TUserRecord): TUserActivityItem[] => {
  if (user.activityLogs?.length) {
    return [...user.activityLogs].sort(
      (current, next) => next.timestamp.getTime() - current.timestamp.getTime(),
    );
  }

  const activities: TUserActivityItem[] = [];

  if (user.createdAt) {
    activities.push(createUserActivity("ACCOUNT_CREATED", user.createdAt));
  }

  if (user.lastLoginAt) {
    activities.push(createUserActivity("LAST_LOGIN", user.lastLoginAt));
  }

  if (user.isVerified && user.updatedAt) {
    activities.push(createUserActivity("ACCOUNT_VERIFIED", user.updatedAt));
  }

  if (user.passwordChangedAt) {
    activities.push(
      createUserActivity("PASSWORD_CHANGED", user.passwordChangedAt),
    );
  }

  if (user.status && user.updatedAt && user.status !== "ACTIVE") {
    activities.push(
      createUserActivity("STATUS_UPDATED", user.updatedAt, {
        title: `Status changed to ${user.status}`,
        description: `Account status is currently ${user.status}.`,
      }),
    );
  }

  if (
    user.updatedAt &&
    user.createdAt &&
    user.updatedAt.getTime() !== user.createdAt.getTime()
  ) {
    activities.push(createUserActivity("PROFILE_UPDATED", user.updatedAt));
  }

  return activities.sort(
    (current, next) => next.timestamp.getTime() - current.timestamp.getTime(),
  );
};

const getAllUsersFromDB = async (
  query: TUserListQuery,
  currentUserId: string,
): Promise<TPaginatedUsers> => {
  const page = parsePositiveNumber(query.page, DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    parsePositiveNumber(query.limit, DEFAULT_LIMIT),
  );
  const skip = (page - 1) * limit;
  const sortBy = getSortClause(query);
  const filter = await buildUserFilters(query);

  filter._id = {
    ...filter._id,
    $ne: new Types.ObjectId(currentUserId),
  };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select(SAFE_USER_SELECT)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean<TUserRecord[]>(),
    User.countDocuments(filter),
  ]);

  const items = await Promise.all(
    users.map((user) => formatUserListItem(user)),
  );

  return {
    items,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

const getMe = async (id: string) => {
  const user = await User.findById(id).select(
    "-password -refreshToken -__v -email_otp -otpExpiresAt -passwordResetToken -passwordResetExpiresAt  -passwordChangedAt",
  );
  return user;
};

const updateProfile = async (
  userId: string,
  payload: any,
  file?: Express.Multer.File,
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  let profilePhotoUrl = user.profilePhoto;

  if (file) {
    // 🔥 upload new image
    const uploadResult = await uploadBufferToCloudinary(file.buffer);

    if (!uploadResult || !uploadResult.secure_url) {
      throw new AppError(400, "Image upload failed");
    }

    profilePhotoUrl = uploadResult.secure_url;

    // 🧹 delete old image
    if (user.profilePhoto) {
      await deleteImageByUrl(user.profilePhoto).catch(() => null);
    }
  }

  const updated = await User.findByIdAndUpdate(
    userId,
    {
      ...payload,
      profilePhoto: profilePhotoUrl,
    },
    { new: true },
  );

  return updated;
};

const getSingleUser = async (id: string): Promise<TUserDetail> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid user id");
  }

  const user = await User.findById(id)
    .select(SAFE_USER_SELECT)
    .lean<TUserRecord | null>();

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const displayId = formatDisplayId(await getUserSequence(user));
  const activityLog = buildActivityLog(user);
  const lastActivityAt =
    activityLog[0]?.timestamp ?? user.updatedAt ?? user.createdAt ?? null;
  const lastLoginAt =
    activityLog.find((activity) => activity.type === "LAST_LOGIN")?.timestamp ??
    user.lastLoginAt ??
    null;

  return {
    summary: {
      _id: user._id.toString(),
      displayId,
      initials: getInitials(user.name),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
      profilePhoto: user.profilePhoto ?? null,
      joinedAt: user.createdAt ?? null,
      lastUpdatedAt: user.updatedAt ?? null,
      lastLoginAt,
      lastActivityAt,
    },
    metrics: {
      accountAgeInDays: getAccountAgeInDays(user.createdAt),
      totalActivities: activityLog.length,
      lastActivityAt,
    },
    profileInformation: {
      fullName: user.name,
      emailAddress: user.email,
      userRole: user.role,
      accountStatus: user.status,
      verified: user.isVerified,
      mobileNumber: user.mobileNumber ?? null,
      profilePhoto: user.profilePhoto ?? null,
    },
    addressInformation: {
      address: user.address ?? null,
    },
  };
};

const getUserActivityLog = async (
  id: string,
  query: Record<string, unknown>,
): Promise<TPaginatedUserActivity> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid user id");
  }

  const user = await User.findById(id)
    .select(SAFE_USER_SELECT)
    .lean<TUserRecord | null>();

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const page = parsePositiveNumber(query.page, DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    parsePositiveNumber(query.limit, DEFAULT_LIMIT),
  );
  const activityLog = buildActivityLog(user);
  const total = activityLog.length;
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    items: activityLog.slice(start, end),
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

const updateUserStatus = async (
  id: string,
  nextStatus: "ACTIVE" | "BLOCKED",
  actorId: string,
): Promise<TUserStatusUpdateResponse> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid user id");
  }

  if (actorId === id && nextStatus === "BLOCKED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot block your own account",
    );
  }

  const user = await User.findById(id).select(SAFE_USER_SELECT);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.status === nextStatus) {
    throw new AppError(
      httpStatus.CONFLICT,
      `User is already ${nextStatus.toLowerCase()}`,
    );
  }

  const changedAt = new Date();

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      $set: { status: nextStatus },
      $push: {
        activityLogs: createUserActivityPush(
          createUserActivity("STATUS_UPDATED", changedAt, {
            title: `Status changed to ${nextStatus}`,
            description: `Account status changed to ${nextStatus}.`,
          }),
        ),
      },
    },
    {
      new: true,
    },
  ).select(SAFE_USER_SELECT);

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return {
    _id: updatedUser._id.toString(),
    name: updatedUser.name,
    email: updatedUser.email,
    status: updatedUser.status,
    updatedAt: updatedUser.updatedAt ?? null,
  };
};

export const UserServices = {
  createUser,
  getAllUsersFromDB,
  getMe,
  getSingleUser,
  updateProfile,
  getUserActivityLog,
  updateUserStatus,
};
