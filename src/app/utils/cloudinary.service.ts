import fs from "fs";
import streamifier from "streamifier";
import { CloudinaryResponse } from "../interfaces";
import { cloudinaryUpload } from "../shared/upload";

const uploadOnCloudinary = async (
  localFilePath: string,
): Promise<CloudinaryResponse | null> => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinaryUpload.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response as CloudinaryResponse;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

export const uploadBufferToCloudinary = (
  fileBuffer: Buffer,
): Promise<CloudinaryResponse | null> => {
  return new Promise((resolve) => {
    const stream = cloudinaryUpload.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "fedicycle/users",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary stream upload error:", error);
          resolve(null);
        } else {
          resolve(result as CloudinaryResponse);
        }
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export { uploadOnCloudinary };
