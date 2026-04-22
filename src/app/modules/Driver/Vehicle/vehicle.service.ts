import httpStatus from "http-status";
import mongoose from "mongoose";
import Vehicle from "./vehicle.model";
import { TVehicle } from "./vehicle.interface";
import AppError from "../../../errors/AppError";

const addVehicle = async (userId: string, payload: TVehicle) => {
  const resolvedPreferredService = payload.preferredService
    ? new mongoose.Types.ObjectId(payload.preferredService as unknown as string)
    : undefined;

  const populateOptions = [
    { path: "user_id", select: "-_id first_name last_name country" },
    { path: "preferredService", select: "-_id -createdAt -updatedAt" },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatResponse = (vehicle: any) => {
    const obj = vehicle.toObject();
    obj.user = obj.user_id;
    delete obj.user_id;
    return obj;
  };

  const existingVehicle = await Vehicle.findOne({ user_id: userId });

  if (existingVehicle) {
    const updatedVehicle = await Vehicle.findOneAndUpdate(
      { user_id: userId },
      { $set: { ...payload, preferredService: resolvedPreferredService } },
      { new: true, runValidators: true },
    ).populate(populateOptions);

    return formatResponse(updatedVehicle);
  }

  const licensePlateExists = await Vehicle.findOne({
    license_plate_number: payload.license_plate_number,
  });

  if (licensePlateExists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `${payload.license_plate_number} already exists`,
    );
  }

  const vehicle = await Vehicle.create({
    ...payload,
    user_id: userId,
    preferredService: resolvedPreferredService,
  });

  const populatedVehicle = await Vehicle.findById(vehicle._id)
    .select(
      "car_brand car_model manufacturing_year license_plate_number car_color car_information_details user_id preferredService createdAt updatedAt",
    )  
    .populate(populateOptions);

  return formatResponse(populatedVehicle);
};

export const VehicleServices = {
  addVehicle,
};
