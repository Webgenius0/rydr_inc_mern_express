import mongoose, { Schema, model } from "mongoose";
import { USER_ROLE, USER_STATUS } from "./user.constant";
import { TUser } from "./user.interface";

const userSchema = new Schema<TUser>(
  {
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,

      match: [
        // eslint-disable-next-line no-useless-escape
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        "Please fill a valid email address",
      ],
    },
    language: {
      type: String,
    },
    agreed_terms_and_conditions: {
      type: Boolean,
    },
    country: {
      type: String,
    },
    province: {
      type: String,
    },
    city: {
      type: String,
    },
    vehicle: { type: mongoose.Types.ObjectId, ref: "Vehicle" },
    phone_otp: { type: String },
    phone_otp_expires_at: { type: Date },
    refreshToken: { type: String },
    current_location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      updatedAt: { type: Date },
    },
    role: {
      type: String,
      enum: Object.keys(USER_ROLE),
      default: USER_ROLE.USER,
    },
    status: {
      type: String,
      enum: Object.keys(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    last_login_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    virtuals: true,
  },
);

userSchema.index({ current_location: "2dsphere" });

export const User = model<TUser>("User", userSchema);
