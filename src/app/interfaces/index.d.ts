/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}