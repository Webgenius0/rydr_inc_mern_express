import httpStatus from "http-status";
import sendResponse from "../../../utils/sendResponse";
import { VehicleServices } from "./vehicle.service";
import { catchAsync } from "../../../utils/catchAsync";
import { Request, Response } from "express";
import AppError from "../../../errors/AppError";

const addVehicle = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const vehicle = await VehicleServices.addVehicle(req.user.id, payload);

  if (!vehicle) {
    throw new AppError(httpStatus.BAD_REQUEST, "Failed to create vehicle");
  }

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Vehicle added successfully!",
    data: vehicle,
  });
});

export const VehicleControllers = {
  addVehicle,
};
