import jwt, { SignOptions } from "jsonwebtoken";
import { UserPayload } from "../types/express";

export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  });
};
