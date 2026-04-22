import httpStatus from "http-status";
import { catchAsync } from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { PreferredServiceServices } from "./preferredService.service";
import { Request, Response } from "express";
import { TPreferredService } from "./preferredService.interface";
import AppError from "../../../errors/AppError";

const createPreferredService = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await PreferredServiceServices.createPreferredService(
    payload
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Preferred service created successfully!",
    data: result,
  });
});

const getAllPreferredServices = catchAsync(async (req: Request, res: Response) => {
  const result = await PreferredServiceServices.getAllPreferredServices();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Preferred services retrieved successfully!",
    data: result,
  });
});

const getPreferredServiceById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await PreferredServiceServices.getPreferredServiceById(id);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Preferred service not found!");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Preferred service retrieved successfully!",
    data: result,
  });
});

const updatePreferredService = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload: Partial<TPreferredService> = req.body;

  const result = await PreferredServiceServices.updatePreferredService(
    id,
    payload
  );

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Preferred service not found!");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Preferred service updated successfully!",
    data: result,
  });
});

const deletePreferredService = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await PreferredServiceServices.deletePreferredService(id);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Preferred service not found!");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Preferred service deleted successfully!",
    data: result,
  });
});

export const PreferredServiceControllers = {
  createPreferredService,
  getAllPreferredServices,
  getPreferredServiceById,
  updatePreferredService,
  deletePreferredService,
};