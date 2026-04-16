import { z } from "zod";
import { USER_ROLE } from "../../User/user.constant";

const rydrOnboardingValidationSchema = z.object({
  body: z.object({
    phone: z.string("Phone is required"),
    country: z.string("Country is required"),
    language: z.string("Language is required"),
    role: z.enum([USER_ROLE.USER], "Role must be USER"),
  }),
});

const rydrVerifyPhoneOTPValidationSchema = z.object({
  body: z.object({
    otp: z.string("OTP is required"),
  }),
});

const rydrCompleteOnboardingValidationSchema = z.object({
  body: z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    agreed_terms_and_conditions: z
      .boolean("Agreed terms and conditions is required")
      .optional(),
    currentLocation: z
      .object({
        type: z.literal("Point"),
        coordinates: z.tuple([
          z.number("Longitude must be a number"),
          z.number("Latitude must be a number"),
        ]),
        updatedAt: z.date().optional(),
      })
      .optional(),
  }),
});

export const RydrOnboardingValidation = {
  rydrOnboardingValidationSchema,
  rydrVerifyPhoneOTPValidationSchema,
  rydrCompleteOnboardingValidationSchema,
};
