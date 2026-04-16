import { USER_ROLE } from "../User/user.constant";

export type TLoginUser = {
  email: string;
  password: string;
};

export type TRegisterUser = {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  role: keyof typeof USER_ROLE;
};

export type TOtpEmailTemplateParams = {
  title?: string;
  email_otp: string;
  expiresMinutes?: number;
  footer?: string;
  name?: string;
};

export type TPasswordChangedTemplateParams = {
  name?: string;
  footer?: string;
};
