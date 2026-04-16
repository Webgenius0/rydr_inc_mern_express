import { USER_ROLE, USER_STATUS } from "./user.constant";

export type TGeoLocation = {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
  updatedAt?: Date;
};



export type TUser = {
  _id?: string; // required for user
  first_name: string; // required for user
  last_name: string; // required for user
  phone?: string; // required for user
  email?: string; // required for user
  language: string; // required for user
  agreed_terms_and_conditions: boolean; // required for user

  country?: string;
  province?: string;
  city?: string;
  preferredService?: string;

  phone_otp?: string;
  phone_otp_expires_at?: Date;
  refreshToken?: string;
  currentLocation?: TGeoLocation;

  role: keyof typeof USER_ROLE; // required for user
  status: keyof typeof USER_STATUS;

  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
};

export type TPaginationMeta = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};
