/* eslint-disable no-console */
import { NextFunction, Request, RequestHandler, Response } from 'express';

export const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error): void => {
      // if (error instanceof Error) {
      //   console.error(error.message);
      // }
      next(error);
    });
  };
};
