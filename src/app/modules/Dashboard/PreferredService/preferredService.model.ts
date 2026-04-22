import mongoose from "mongoose";
import { TPreferredService } from "./preferredService.interface";

const PreferredServiceSchema = new mongoose.Schema<TPreferredService>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    vehicle_image: { type: String, required: true },
    can_take_passenger: { type: Number, required: true },
  },
  { timestamps: true, versionKey: false },
);

const PreferredServiceModel = mongoose.model(
  "PreferredService",
  PreferredServiceSchema,
);

export default PreferredServiceModel;