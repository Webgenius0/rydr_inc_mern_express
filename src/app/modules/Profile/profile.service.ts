import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import { TImageFile } from '../../interfaces/image.interface';
import {
    deleteImageByPublicId,
    extractCloudinaryPublicIdFromUrl,
} from '../../shared/upload';
import { createUserActivity, createUserActivityPush } from '../User/user.activity';
import { USER_STATUS } from '../User/user.constant';
import { User } from '../User/user.model';
import { TUserProfileUpdate } from './profile.interface';

const getMyProfile = async (user: JwtPayload) => {
    const profile = await User.findOne({
        email: user.email,
        status: USER_STATUS.ACTIVE,
    });

    if (!profile) {
        throw new AppError(httpStatus.NOT_FOUND, 'User does not exixts!');
    }

    return profile;
};

const updateMyProfile = async (
    user: JwtPayload,
    data: Partial<TUserProfileUpdate>,
    profilePhoto?: TImageFile,
) => {
    const filter = {
        email: user.email,
        status: USER_STATUS.ACTIVE,
    };

    const profile = await User.findOne(filter);

    if (!profile) {
        throw new AppError(httpStatus.NOT_FOUND, 'User profile does not exixts!');
    }

    if (profilePhoto) {
        data.profilePhoto = profilePhoto.path;
    } else {
        delete data.profilePhoto;
    }

    const changedFields = Object.entries(data).filter(([key, value]) => {
        return profile.get(key) !== value;
    });

    if (changedFields.length === 0) {
        return profile;
    }

    const updatedAt = new Date();
    const previousProfilePhoto = profile.profilePhoto;

    const updatedProfile = await User.findOneAndUpdate(
        filter,
        {
            $set: data,
            $push: {
                activityLogs: createUserActivityPush(
                    createUserActivity('PROFILE_UPDATED', updatedAt),
                ),
            },
        },
        { new: true },
    );

    const previousPublicId = extractCloudinaryPublicIdFromUrl(previousProfilePhoto);
    const nextPublicId = profilePhoto?.filename;

    if (previousPublicId && profilePhoto && previousPublicId !== nextPublicId) {
        await deleteImageByPublicId(previousPublicId);
    }

    return updatedProfile;
};

export const ProfileServices = {
    getMyProfile,
    updateMyProfile,
};
