import mongoose from "mongoose";

export type TPreferredService = {
  title: string;
  description: string;
  vehicle_image: string;
  can_take_passenger: number;
};

export type TPreferredServiceMethods = {
  toObject(): Partial<TPreferredService>;
};

export type TPreferredServiceDocument = TPreferredService &
  mongoose.Document &
  TPreferredServiceMethods;