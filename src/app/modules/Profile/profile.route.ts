import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { multerUpload } from '../../shared/upload';
import { USER_ROLE } from '../User/user.constant';
import { ProfileController } from './profile.controller';
import { updateMyProfileZodSchema } from './profile.validation';

const router = express.Router();

router.get(
    '/',
    auth(USER_ROLE.SELLER, USER_ROLE.CUSTOMER),
    ProfileController.getMyProfile,
);

router.patch(
    '/',
    auth(USER_ROLE.SELLER, USER_ROLE.CUSTOMER),
    multerUpload.fields([{ name: 'profilePhoto', maxCount: 1 }]),
    validateRequest(updateMyProfileZodSchema),
    ProfileController.updateMyProfile,
);

export const ProfileRoutes = router;
