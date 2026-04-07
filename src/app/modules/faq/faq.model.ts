import { Schema, model } from "mongoose";
import { TFaq } from "./faq.interface";

const faqSchema = new Schema<TFaq>(
  {
    pageKey: { type: String, required: true, index: true }, // about / finance / home 
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

// helpful for sorting
faqSchema.index({ pageKey: 1, order: 1 });

export const Faq = model<TFaq>("Faq", faqSchema);