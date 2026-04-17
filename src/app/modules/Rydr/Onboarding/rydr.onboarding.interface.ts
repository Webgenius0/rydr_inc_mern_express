import { TGeoLocation } from "../../User/user.interface";

export type TRydrOnboarding = {
  phone: string;
  language: string;
};

export type TRydrVerifyPhoneOTP = {
  phone: string;
  otp: string;
};

export type TRydrCompleteOnboarding = {
  first_name: string;
  last_name: string;
  email: string;
  agreed_terms_and_conditions: boolean;
  currentLocation: TGeoLocation;
};
