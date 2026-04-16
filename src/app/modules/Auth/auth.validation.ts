import { z } from "zod";

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Name is required",
    }),
    email: z.string({
      required_error: "Email is required",
    }),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(6, "Password must be at least 6 characters long")
      .refine((value) => /[a-zA-Z]/.test(value), {
        message: "Password must contain at least one letter",
      }),
  }),
});
const verifyOTPValidationSchema = z.object({
  body: z.object({
    email_otp: z.string({ required_error: "email_otp is required" }),
    email: z.string({ required_error: "Email is required" }),
  }),
});
const resendOtpValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required" }),
  }),
});
const resetPasswordValidationSchema = z.object({
  body: z.object({
    newPassword: z.string({ required_error: "New password is required" }),
    resetToken: z.string({ required_error: "Reset token is required" }),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: "Email is required",
    }),
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(6, "Password must be at least 6 characters long")
      .refine((value) => /[a-zA-Z]/.test(value), {
        message: "Password must contain at least one letter",
      }),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      required_error: "Old password is required",
    }),
    newPassword: z
      .string({
        required_error: "Password is required",
      })
      .min(6, "Password must be at least 6 characters long")
      .refine((value) => /[a-zA-Z]/.test(value), {
        message: "Password must contain at least one letter",
      }),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: "Refresh token is required!",
    }),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  verifyOTPValidationSchema,
  resendOtpValidationSchema,
  resetPasswordValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
};
