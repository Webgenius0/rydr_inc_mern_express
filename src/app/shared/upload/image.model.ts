import { Schema, model } from "mongoose";

const imageSchema = new Schema({
  hash: { type: String, unique: true, required: true },
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  referenceCount: { type: Number, default: 1 },
});

export const ImageModel = model("Image", imageSchema);
