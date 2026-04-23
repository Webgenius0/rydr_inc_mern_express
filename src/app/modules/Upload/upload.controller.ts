import { Request, Response, NextFunction } from 'express';
import { multerUpload } from '../../shared/upload/multer.config';
import { uploadOrGetExistingImage } from '../../shared/upload/duplicateImage.service';
import {  TImageFileArray, TImageFile } from '../../interfaces/image.interface';
import { safeDeleteImageByUrl } from '../../shared/upload/deleteImage';
import AppError from '../../errors/AppError';
import { ALLOWED_IMAGE_TYPES } from '../../shared/upload/upload.constants';

export const uploadFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const isMultiple = req.query.multiple === 'true';
    
    let upload;
    if (isMultiple) {
      upload = multerUpload.array('files', 10);
    } else {
      upload = multerUpload.single('file');
    }
    
    upload(req, res, async (err) => {
      if (err) {
        return next(new AppError(400, err.message));
      }
      
      let files: TImageFileArray | undefined;
      let singleFile: TImageFile | undefined;
      
      if (isMultiple) {
        files = req.files as TImageFileArray | undefined;
        
        if (!files || files.length === 0) {
          return next(new AppError(400, 'No files uploaded'));
        }
      } else {
        singleFile = req.file as TImageFile | undefined;
        
        if (!singleFile) {
          return next(new AppError(400, 'No file uploaded'));
        }
      }
      
 
      const filesToValidate = isMultiple ? files! : [singleFile!];
      
      for (const file of filesToValidate) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
          return next(new AppError(400, 'Only JPG, JPEG, PNG and WEBP images are allowed'));
        }
      }
      
      try {
 
        if (isMultiple) {
          // Multiple file upload
          const uploadPromises = files!.map(file => uploadOrGetExistingImage(file));
          const results = await Promise.all(uploadPromises);
          
          res.status(200).json({
            success: true,
            message: 'Files uploaded successfully',
            data: {
              urls: results,
              count: results.length
            }
          });
        } else {
          // Single file upload
          const result = await uploadOrGetExistingImage(singleFile!);
          
          res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
              url: result
            }
          });
        }
      } catch (uploadError) {
        next(new AppError(500, 'Failed to upload files'));
      }
    });
  } catch (error) {
    next(error);
  }
};

 
export const deleteFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { urls } = req.body;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return next(new AppError(400, 'URLs array is required'));
    }
    
    try {
      // Delete each file
      const deletePromises = urls.map(url => safeDeleteImageByUrl(url));
      const results = await Promise.all(deletePromises);
      
      const successfulDeletions = results.filter(result => result !== null).length;
      
      res.status(200).json({
        success: true,
        message: `Deleted ${successfulDeletions} file(s) successfully`,
        data: {
          deletedCount: successfulDeletions,
          totalRequested: urls.length
        }
      });
    } catch (deleteError) {
      next(new AppError(500, 'Failed to delete files'));
    }
  } catch (error) {
    next(error);
  }
};