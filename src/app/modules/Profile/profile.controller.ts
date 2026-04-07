import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { TImageFile, TImageFiles } from '../../interfaces/image.interface';
import sendResponse from '../../utils/sendResponse';
import { ProfileServices } from './profile.service';

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await ProfileServices.getMyProfile(user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'My Profile Retrive Successfully',
        data: result,
    });
});

const updateMyProfile = catchAsync(async (req, res) => {
    const files = req.files as TImageFiles | undefined;
    const profilePhoto = files?.profilePhoto?.[0] as TImageFile | undefined;

    const result = await ProfileServices.updateMyProfile(
        req.user,
        req.body,
        profilePhoto,
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Profile updated successfully',
        data: result,
    });
});

export const ProfileController = {
    getMyProfile,
    updateMyProfile,
};
