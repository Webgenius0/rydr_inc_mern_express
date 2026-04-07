import { TImageFile, TImageFileArray, TImageFiles } from '../../interfaces/image.interface';

export const removeExtension = (filename: string) => {
  return filename.split('.').slice(0, -1).join('.');
};

export const extractCloudinaryPublicIdFromUrl = (url?: string | null) => {
  if (!url) return null;

  const uploadMarker = '/upload/';
  const markerIndex = url.indexOf(uploadMarker);

  if (markerIndex === -1) return null;

  const pathAfterUpload = url.slice(markerIndex + uploadMarker.length);
  const normalizedPath = pathAfterUpload.replace(/^v\d+\//, '');
  const lastDotIndex = normalizedPath.lastIndexOf('.');

  return lastDotIndex === -1
    ? normalizedPath
    : normalizedPath.slice(0, lastDotIndex);
};

const findMatchingFileFromArray = (files?: TImageFileArray) => {
  if (!files?.length) return undefined;

  return files.find(
    (file) => file.fieldname === 'profilePhoto',
  );
};

export const getUploadedProfilePhoto = (
  files?: TImageFiles | TImageFileArray,
  file?: TImageFile,
) => {
  if (Array.isArray(files)) {
    return findMatchingFileFromArray(files);
  }

  return files?.profilePhoto?.[0] ?? files?.profileImage?.[0] ?? file;
};
