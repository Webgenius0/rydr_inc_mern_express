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
  preferredService?: string;
  
  phone_otp?: string; 
  phone_otp_expires_at?: Date;
  refreshToken?: string;
  currentLocation?: TGeoLocation;
  role: keyof typeof USER_ROLE;
  status: keyof typeof USER_STATUS;

  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
};

export type TGeoLocation = {
  type: "Point";
  coordinates: [number, number];
  updatedAt?: Date;
};

