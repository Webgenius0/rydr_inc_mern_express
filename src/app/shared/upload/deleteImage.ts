import {
  TImageFile,
  TImageFileArray,
  TImageFiles,
} from "../../interfaces/image.interface";
import { cloudinaryUpload } from "./cloudinary.config";
import { ImageModel } from "./image.model";
import { extractCloudinaryPublicIdFromUrl } from "./upload.utils";

export const deleteImageByPublicId = async (publicId: string) => {
  if (!publicId) return null;

  return cloudinaryUpload.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
};

export const deleteSingleImageFromCloudinary = async (
  file?: TImageFile | null,
) => {
  if (!file?.filename) return null;
  return deleteImageByPublicId(file.filename);
};

export const deleteImageByUrl = async (url?: string | null) => {
  const publicId = extractCloudinaryPublicIdFromUrl(url);
  if (!publicId) return null;
  return deleteImageByPublicId(publicId);
};

const getUploadedFiles = (files: TImageFiles | TImageFileArray) => {
  if (Array.isArray(files)) {
    return files;
  }

  return Object.values(files).flat();
};

export const deleteImageFromCloudinary = (
  files: TImageFiles | TImageFileArray,
) => {
  const publicIds = getUploadedFiles(files)
    .map((image) => image.filename)
    .filter(Boolean);

  if (!publicIds || publicIds.length === 0) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    cloudinaryUpload.api.delete_resources(
      publicIds,
      { resource_type: "image" },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );
  });
};

export const safeDeleteImageByUrl = async (url: string) => {
  const imageInDb = await ImageModel.findOneAndUpdate(
    { url },
    { $inc: { referenceCount: -1 } },
    { new: true },
  );
  if (imageInDb && imageInDb.referenceCount <= 0) {
    await deleteImageByPublicId(imageInDb.public_id);
    await ImageModel.findByIdAndDelete(imageInDb._id);
  }
};
export { extractCloudinaryPublicIdFromUrl };
