/* eslint-disable no-useless-escape */
import bcryptjs from 'bcryptjs';
import { Schema, model } from 'mongoose';
import config from '../../config';
import { USER_ROLE, USER_STATUS } from './user.constant';
import { IUserModel, TUser } from './user.interface';
import crypto from 'crypto';
import { createUserActivity } from './user.activity';
const userSchema = new Schema<TUser, IUserModel>(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.keys(USER_ROLE),
      default: USER_ROLE.CUSTOMER,
    },
    email: {
      type: String,
      required: true,
      //validate email
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        'Please fill a valid email address',
      ],
    },
    password: {
      type: String,
      required: true,
      select: 0,
    },
    status: {
      type: String,
      enum: Object.keys(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: {
      type: Date,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    mobileNumber: {
      type: String,
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    activityLogs: {
      type: [
        {
          _id: false,
          id: { type: String, required: true },
          type: { type: String, required: true },
          title: { type: String, required: true },
          description: { type: String, required: true },
          timestamp: { type: Date, required: true },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    virtuals: true,
  },
);


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  if (!this.password) return next(new Error('Password is required'));

  this.password = await bcryptjs.hash(
    this.password,
    Number(config.bcrypt_salt_rounds),
  );

  next();
});

userSchema.pre('save', function (next) {
  if (this.isNew && (!this.activityLogs || this.activityLogs.length === 0)) {
    const createdAt = this.createdAt ?? new Date();
    this.activityLogs = [createUserActivity('ACCOUNT_CREATED', createdAt)];
  }

  next();
});


userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({ email }).select('+password');
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcryptjs.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: number,
  jwtIssuedTimestamp: number,
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};


export const User = model<TUser, IUserModel>('User', userSchema);
