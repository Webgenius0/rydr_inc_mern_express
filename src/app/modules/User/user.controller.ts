import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";
import { Request, Response } from "express";

const userRegister = catchAsync(async (req: Request, res: Response) => {
  const user = await UserServices.createUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Created Successfully",
    data: user,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await UserServices.getAllUsersFromDB(req.query, req.user._id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Users Retrieved Successfully",
    data: users,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await UserServices.getMe(req.user._id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Retrieved Successfully",
    data: user,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const user = await UserServices.getSingleUser(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Retrieved Successfully",
    data: user,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user._id;
  const file = req.file;

  const updatedUser = await UserServices.updateProfile(userId, req.body, file);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});
const getUserActivityLog = catchAsync(async (req: Request, res: Response) => {
  const activityLog = await UserServices.getUserActivityLog(
    req.params.id,
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Activity Retrieved Successfully",
    data: activityLog,
  });
});

const blockUser = catchAsync(async (req: Request, res: Response) => {
  const user = await UserServices.updateUserStatus(
    req.params.id,
    "BLOCKED",
    req.user._id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Blocked Successfully",
    data: user,
  });
});

const unblockUser = catchAsync(async (req: Request, res: Response) => {
  const user = await UserServices.updateUserStatus(
    req.params.id,
    "ACTIVE",
    req.user._id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Unblocked Successfully",
    data: user,
  });
});

export const UserControllers = {
  getAllUsers,
  getMe,
  getSingleUser,
  getUserActivityLog,
  updateProfile,
  blockUser,
  unblockUser,
  userRegister,
};
