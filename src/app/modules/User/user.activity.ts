import { TUserActivityItem, TUserActivityType } from './user.interface';

const activityContent: Record<
  TUserActivityType,
  { prefix: string; title: string; description: string }
> = {
  ACCOUNT_CREATED: {
    prefix: 'created',
    title: 'Account created',
    description: 'User account was created.',
  },
  PROFILE_UPDATED: {
    prefix: 'updated',
    title: 'Profile updated',
    description: 'User profile information was updated.',
  },
  PASSWORD_CHANGED: {
    prefix: 'password',
    title: 'Password changed',
    description: 'User password was updated.',
  },
  ACCOUNT_VERIFIED: {
    prefix: 'verified',
    title: 'Account verified',
    description: 'User email/account verification completed.',
  },
  STATUS_UPDATED: {
    prefix: 'status',
    title: 'Account status updated',
    description: 'User account status was updated.',
  },
  LAST_LOGIN: {
    prefix: 'login',
    title: 'User logged in',
    description: 'User logged into the account.',
  },
};

export const createUserActivity = (
  type: TUserActivityType,
  timestamp: Date = new Date(),
  overrides?: Partial<Pick<TUserActivityItem, 'title' | 'description'>>,
): TUserActivityItem => {
  const content = activityContent[type];

  return {
    id: `${content.prefix}-${timestamp.getTime()}`,
    type,
    title: overrides?.title ?? content.title,
    description: overrides?.description ?? content.description,
    timestamp,
  };
};

export const createUserActivityPush = (activity: TUserActivityItem) => ({
  $each: [activity],
  $slice: -100,
});
