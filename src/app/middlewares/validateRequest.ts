import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import { catchAsync } from '../utils/catchAsync';
const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.product && typeof req.body.product === 'string') {
      req.body.product = JSON.parse(req.body.product);
    }
    if (req.body.galleryUploadMap && typeof req.body.galleryUploadMap === 'string') {
      req.body.galleryUploadMap = JSON.parse(req.body.galleryUploadMap);
    }

    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies,
    });

    req.body = parsed.body;
    req.query = parsed.query;
    req.params = parsed.params;
    req.cookies = parsed.cookies;

    return next();
  });
};


export const validateRequestCookies = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsedCookies = await schema.parseAsync({
      cookies: req.cookies,
    });

    req.cookies = parsedCookies.cookies;

    next();
  });
};

export default validateRequest;
