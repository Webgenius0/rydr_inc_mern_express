import { z } from "zod";

export const createFaqSchema = z.object({
    body: z.object({
        pageKey: z.string().min(1, "pageKey required"), // about/finance
        question: z.string().min(5, "Question required"),
        answer: z.string().min(5, "Answer required"),
        isActive: z.boolean().optional(),
    }),
});

export const updateFaqSchema = z.object({
    body: z.object({
        question: z.string().min(5).optional(),
        answer: z.string().min(5).optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
    }),
});

export const reorderFaqSchema = z.object({
    body: z.object({
        pageKey: z.string().min(1),
        items: z
            .array(
                z.object({
                    id: z.string().min(1),
                    order: z.number(),
                })
            )
            .min(1),
    }),
});