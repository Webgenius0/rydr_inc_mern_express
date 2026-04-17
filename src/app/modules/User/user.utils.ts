import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { TUser } from "./user.interface";
import config from "../../config";

export const generateAccessToken = (user: TUser) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      phone: user.phone || "",
      email: user.email || ""
    },
    config.jwt_access_secret as string,
    {
      expiresIn: config.jwt_access_expires_in as SignOptions["expiresIn"],
    },
  );
};
export const generateRefreshToken = (user: TUser) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      phone: user.phone || "",
      email: user.email || ""
    },
    config.jwt_refresh_secret as string,
    {
      expiresIn: config.jwt_refresh_expires_in as SignOptions["expiresIn"],
    },
  );
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};
