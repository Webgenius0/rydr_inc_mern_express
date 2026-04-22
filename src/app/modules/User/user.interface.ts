import mongoose from "mongoose";
import { USER_ROLE, USER_STATUS } from "./user.constant";

export type TUser = {
  _id?: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  language: string;
  agreed_terms_and_conditions: boolean;

  country?: string;
  province?: string;
  city?: string;
  vehicle?: mongoose.Types.ObjectId;

  phone_otp?: string;
  phone_otp_expires_at?: Date;
  refreshToken?: string;
  current_location?: TGeoLocation;
  role: keyof typeof USER_ROLE;
  status: keyof typeof USER_STATUS;

  createdAt?: Date;
  updatedAt?: Date;
  last_login_at?: Date;
};

export type TGeoLocation = {
  type: "Point";
  coordinates: [number, number];
  updatedAt?: Date;
};
