import { USER_ROLE } from "../../User/user.constant";
import { TGeoLocation } from "../../User/user.interface";

export type TRydrOnboarding = {
  phone: string;
  country: string;
  language: string;
  role: keyof typeof USER_ROLE;
};

export type TRydrVerifyPhoneOTP = {
  otp: string;
};

export type TRydrCompleteOnboarding = {
  first_name: string;
  last_name: string;
  email: string;
  agreed_terms_and_conditions: boolean;
  currentLocation: TGeoLocation;
};
