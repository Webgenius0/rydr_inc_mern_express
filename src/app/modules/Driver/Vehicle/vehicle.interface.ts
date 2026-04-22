/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

export type TVehicle = {
  _id?: string;
  user_id: mongoose.Types.ObjectId;
  preferredService: mongoose.Types.ObjectId;
  car_brand: string;
  car_model: string;
  manufacturing_year: number;
  license_plate_number: string;
  car_color: string;
  car_information_details: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
};
