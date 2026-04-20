import { z } from "zod";

const onboardingValidationSchema = z.object({
  body: z.object({
    phone: z.string({ required_error: "Phone is required" }),
    language: z.string({ required_error: "Language is required" }),
  }),
});

const verifyPhoneOTPValidationSchema = z.object({
  body: z.object({
    phone: z.string({ required_error: "Phone is required" }),
    otp: z.string({ required_error: "OTP is required" }),
  }),
});
const resendPhoneOTPValidationSchema = z.object({
  body: z.object({
    phone: z.string({ required_error: "Phone is required" }),
  }),
});

const completeOnboardingValidationSchema = z.object({
  body: z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    agreed_terms_and_conditions: z
      .boolean({ required_error: "Agreed terms and conditions is required" })
      .optional(),
    currentLocation: z
      .object({
        type: z.literal("Point"),
        coordinates: z.tuple([
          z.number({ invalid_type_error: "Longitude must be a number" }),
          z.number({ invalid_type_error: "Latitude must be a number" }),
        ]),
        updatedAt: z.coerce.date().optional(),
      })
      .optional(),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({ required_error: "Refresh token is required" }),
  }),
});

export const RydrOnboardingValidation = {
  onboardingValidationSchema,
  verifyPhoneOTPValidationSchema,
  resendPhoneOTPValidationSchema,
  completeOnboardingValidationSchema,
  refreshTokenValidationSchema,
};
