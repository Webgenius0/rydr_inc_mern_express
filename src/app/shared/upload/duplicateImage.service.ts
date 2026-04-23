/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from "crypto";
import { cloudinaryUpload } from "./cloudinary.config";
import { ImageModel } from "./image.model";
import streamifier from "streamifier";
const generateHash = (buffer: Buffer) => {
  return crypto.createHash("md5").update(buffer).digest("hex");
};

export const uploadOrGetExistingImage = async (file: any) => {
  const hash = generateHash(file.buffer);

 
  const existing = await ImageModel.findOne({ hash });

  if (existing) {
    // if get duplicate image then increase reference count
    existing.referenceCount += 1;
    await existing.save();
    return existing.url;
  }

  const result: any = await new Promise((resolve, reject) => {
    const stream = cloudinaryUpload.uploader.upload_stream(
      {
        folder: "fedicycle/products",
        public_id: `product-${hash}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });

  await ImageModel.create({
    hash,
    url: result.secure_url,
    public_id: result.public_id,
  });

  return result.secure_url;
};
