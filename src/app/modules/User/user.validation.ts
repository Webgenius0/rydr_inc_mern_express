import { z } from "zod";
import { USER_ROLE, USER_STATUS } from "./user.constant";

const createUserValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: "Name is required",
    }),
    role: z.nativeEnum(USER_ROLE),
    email: z
      .string({
        required_error: "Email is required",
      })
      .email({
        message: "Invalid email",
      }),
    password: z.string({
      required_error: "Password is required",
    }),
    status: z.nativeEnum(USER_STATUS).default(USER_STATUS.ACTIVE),
    mobileNumber: z.string().optional(),
  }),
});

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    role: z.nativeEnum(USER_ROLE).optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
    status: z.nativeEnum(USER_STATUS).optional(),
    mobileNumber: z.string().optional(),
  }),
});

const updateUserProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    mobileNumber: z.string().optional(),
    profilePhoto: z.string().url("Must be a valid URL").nullable().optional(),
    address: z.string().optional(),
  }),
});

export const UserValidation = {
  createUserValidationSchema,
  updateUserValidationSchema,
  updateUserProfileSchema,
};
