import { Schema, model } from "mongoose";
import { USER_ROLE, USER_STATUS } from "./user.constant";
import { TUser } from "./user.interface";

const userSchema = new Schema<TUser>(
  {
    first_name: { type: String },
    last_name: { type: String },
    phone: { type: String, unique: true, sparse: true },
    email: {
      type: String,
      unique: true,
      sparse: true,
      match: [
        /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        "Please fill a valid email address",
      ],
    },
    language: { type: String },
    agreed_terms_and_conditions: { type: Boolean },
    country: { type: String },
    province: { type: String },
    city: { type: String },

    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },

    preferredService: { type: String },
    role: {
      type: String,
      enum: Object.keys(USER_ROLE),
      default: USER_ROLE.USER,
      index: true,
    },
    status: {
      type: String,
      enum: Object.keys(USER_STATUS),
      default: USER_STATUS.ACTIVE,
      index: true,
    },
    refreshToken: { type: String, default: null },
    lastLoginAt: { type: Date, default: null },
    phone_otp: { type: String },
    phone_otp_expires_at: { type: Date },
  },
  {
    timestamps: true,
    virtuals: true,
    versionKey: false,
  },
);

userSchema.index({ currentLocation: "2dsphere" });

export const User = model<TUser>("User", userSchema);
