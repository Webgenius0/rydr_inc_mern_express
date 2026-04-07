import AppError from '../errors/AppError';
import { catchAsync } from '../utils/catchAsync';

export const parseBody = catchAsync(async (req, res, next) => {
  if (!req.body.data) {
    throw new AppError(400, 'Please provide data in the body under data key');
  }

  try {
    req.body = JSON.parse(req.body.data);
  } catch {
    throw new AppError(400, 'Invalid JSON provided in body.data');
  }

  next();
});

export const parseBodyData = catchAsync(async (req, res, next) => {
  if (typeof req.body?.data !== 'string') {
    return next();
  }

  try {
    req.body = JSON.parse(req.body.data);
  } catch {
    throw new AppError(400, 'Invalid JSON provided in body.data');
  }

  next();
});
