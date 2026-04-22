import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import { TPreferredService } from "./preferredService.interface";
import PreferredServiceModel from "./preferredService.model";

const createPreferredService = async (payload: TPreferredService) => {
  const result = await PreferredServiceModel.create(payload);
  return result;
};

const getAllPreferredServices = async () => {
  const result = await PreferredServiceModel.find().select(
    "title description vehicle_image can_take_passenger",
  );
  return result;
};

const getPreferredServiceById = async (id: string) => {
  const result = await PreferredServiceModel.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Preferred service not found!");
  }
  return result;
};

const updatePreferredService = async (
  id: string,
  payload: Partial<TPreferredService>,
) => {
  const existingService = await PreferredServiceModel.findById(id);
  if (!existingService) {
    throw new AppError(httpStatus.NOT_FOUND, "Preferred service not found!");
  }

  const result = await PreferredServiceModel.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deletePreferredService = async (id: string) => {
  const existingService = await PreferredServiceModel.findById(id);
  if (!existingService) {
    throw new AppError(httpStatus.NOT_FOUND, "Preferred service not found!");
  }

  const result = await PreferredServiceModel.findByIdAndDelete(id);
  return result;
};

export const PreferredServiceServices = {
  createPreferredService,
  getAllPreferredServices,
  getPreferredServiceById,
  updatePreferredService,
  deletePreferredService,
};
