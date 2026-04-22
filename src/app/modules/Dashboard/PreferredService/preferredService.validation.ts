import { z } from "zod";

export const createPreferredServiceValidationSchema = z.object({
  body: z.object({
    title: z.string({ required_error: "Title is required" }),
    description: z.string({ required_error: "Description is required" }),
    vehicle_image: z.string({ required_error: "Vehicle image is required" }),
    can_take_passenger: z.number({ required_error: "Can take passenger is required" }),
  }),
});

export const updatePreferredServiceValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    vehicle_image: z.string().optional(),
    can_take_passenger: z.number().optional(),
  }),
});

export const getPreferredServiceByIdValidationSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "ID is required" }),
  }),
});

export const RydrPreferredServiceValidation = {
  createPreferredServiceValidationSchema,
  updatePreferredServiceValidationSchema,
  getPreferredServiceByIdValidationSchema,
};