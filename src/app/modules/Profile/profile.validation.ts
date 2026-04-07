import { z } from "zod";

export const updateMyProfileZodSchema = z.object({
    body: z
        .object({
            name: z.string().trim().min(2).max(80).optional(),
            mobileNumber: z.string().trim().min(5).max(20).optional(),
            address: z.string().trim().max(200).optional(),
        })
        .refine((value) => Object.keys(value).length > 0, {
            message: "At least one profile field is required",
        }),
});