import mongoose, { Schema, Model } from "mongoose";
import { TVehicle } from "./vehicle.interface";

const VehicleSchema = new Schema<TVehicle>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User", // reference to User model
      required: true,
    },
    preferredService: {
      type: mongoose.Types.ObjectId,
      ref: "PreferredService",
    },
    car_brand: {
      type: String,
      required: true,
      trim: true,
    },
    car_model: {
      type: String,
      required: true,
      trim: true,
    },
    manufacturing_year: {
      type: Number,
      required: true,
    },
    license_plate_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    car_color: {
      type: String,
      required: true,
      trim: true,
    },
    car_information_details: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Vehicle: Model<TVehicle> = mongoose.model<TVehicle>(
  "Vehicle",
  VehicleSchema,
);

export default Vehicle;
