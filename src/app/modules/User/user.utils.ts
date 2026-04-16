import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { USER_ROLE } from "./user.constant";

export const generateToken = (
  jwtPayload: {
    phone: string;
    country: string;
    language: string;
    role: keyof typeof USER_ROLE;
  },
  secret: string,
  expiresIn: string,
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};
