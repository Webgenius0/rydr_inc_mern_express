import { TGeoLocation } from "../../User/user.interface";

export type TDriverOnboarding = {
  phone: string;
  language: string;
};

export type TDriverVerifyPhoneOTP = {
  phone: string;
  otp: string;
};

export type TDriverCompleteOnboarding = {
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  province: string;
  city: string;
  agreed_terms_and_conditions: boolean;
  current_location?: TGeoLocation;
};
