import jwt, { SignOptions } from "jsonwebtoken";
import config from "../../config";

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret);
};

export const generateToken = (payload: object, secret: string, expiresIn?: string) => {
  const options: SignOptions = expiresIn ? { expiresIn: expiresIn as SignOptions['expiresIn'] } : {};
  return jwt.sign(payload, secret, options);
};

export const generateAccessToken = (user: { _id: string; role: string }) => {
  return generateToken(
    { id: user._id, role: user.role },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
};

export const generateRefreshToken = (user: { _id: string }) => {
  return generateToken(
    { id: user._id },
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );
};