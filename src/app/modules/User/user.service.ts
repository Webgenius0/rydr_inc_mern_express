/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { TUser } from "./user.interface";
import { User } from "./user.model";
import { uploadBufferToCloudinary } from "../../utils/cloudinary.service";
import { deleteImageByUrl } from "../../shared/upload/deleteImage";

const SAFE_USER_SELECT =
  "-__v -email_otp -otpExpiresAt -passwordResetToken -passwordResetExpires";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

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

const isAllFilter = (value: unknown) =>
  normalizeString(value).toUpperCase() === "ALL";

const buildUserFilters = async (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {};
  const searchTerm = normalizeString(query.searchTerm);

  if (searchTerm) {
    filter.$or = [
      { first_name: { $regex: searchTerm, $options: "i" } },
      { last_name: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
      { phone: { $regex: searchTerm, $options: "i" } },
    ];
  }

  if (query.role && !isAllFilter(query.role)) {
    filter.role = query.role as string;
  }

  if (query.status && !isAllFilter(query.status)) {
    filter.status = query.status as string;
  }

  return filter;
};

const getSortClause = (query: Record<string, unknown>) => {
  const sortValue = normalizeString(query.sort).toLowerCase();

  if (sortValue === "oldest_created" || sortValue === "oldest(created)") {
    return "createdAt";
  }

  if (sortValue === "name_asc" || sortValue === "name_desc") {
    return sortValue === "name_asc" ? "first_name" : "-first_name";
  }

  if (sortValue === "last_updated") {
    return "-updatedAt";
  }

  return typeof query.sortBy === "string" ? query.sortBy : "-createdAt";
};

const formatUserListItem = (user: any) => {
  return {
    _id: user._id?.toString() ?? "",
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    role: user.role ?? "USER",
    status: user.status ?? "ACTIVE",
    language: user.language ?? "en",
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
  };
};

const getAllUsersFromDB = async (
  query: Record<string, unknown>,
  currentUserId: string,
) => {
  const page = parsePositiveNumber(query.page, DEFAULT_PAGE);
  const limit = Math.min(
    MAX_LIMIT,
    parsePositiveNumber(query.limit, DEFAULT_LIMIT),
  );
  const skip = (page - 1) * limit;
  const sortBy = getSortClause(query);
  const filter = await buildUserFilters(query);

  (filter as any)._id = { $ne: new Types.ObjectId(currentUserId) };

  const [users, total] = await Promise.all([
    User.find(filter as any)
      .select(SAFE_USER_SELECT)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter as any),
  ]);

  const items = users.map((user: any) => formatUserListItem(user));

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
    "-password -refreshToken -__v -email_otp -otpExpiresAt -passwordResetToken -passwordResetExpiresAt",
  );
  return user;
};

const updateProfile = async (
  userId: string,
  payload: Partial<TUser>,
  file?: Express.Multer.File,
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found");
  }

  let profilePhotoUrl: string | undefined;

  if (file) {
    const uploadResult = await uploadBufferToCloudinary(file.buffer);

    if (!uploadResult || !uploadResult.secure_url) {
      throw new AppError(400, "Image upload failed");
    }

    profilePhotoUrl = uploadResult.secure_url;

    const existingPhoto = (user as any).profilePhoto;
    if (existingPhoto) {
      await deleteImageByUrl(existingPhoto).catch(() => null);
    }
  }

  const updated = await User.findByIdAndUpdate(
    userId,
    {
      ...payload,
      ...(profilePhotoUrl && { profilePhoto: profilePhotoUrl }),
    },
    { new: true },
  );

  return updated;
};

const getSingleUser = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid user id");
  }

  const user = await User.findById(id).select(SAFE_USER_SELECT).lean();

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return {
    _id: user._id?.toString() ?? "",
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    role: user.role ?? "USER",
    status: user.status ?? "ACTIVE",
    language: user.language ?? "en",
    country: user.country ?? null,
    province: user.province ?? null,
    city: user.city ?? null,
    preferredService: user.preferredService ?? null,
    agreed_terms_and_conditions: user.agreed_terms_and_conditions ?? false,
    createdAt: user.createdAt ?? null,
    updatedAt: user.updatedAt ?? null,
    lastLoginAt: user.lastLoginAt ?? null,
  };
};

const updateUserStatus = async (
  id: string,
  nextStatus: "ACTIVE" | "BLOCKED",
) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid user id");
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

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { status: nextStatus },
    { new: true },
  ).select(SAFE_USER_SELECT);

  if (!updatedUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return {
    _id: updatedUser._id.toString(),
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
  updateUserStatus,
};