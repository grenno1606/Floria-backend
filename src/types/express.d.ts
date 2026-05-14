import { Request } from "express";

export interface UserPayload {
  user_id: number;
  role: "user" | "admin";
}

export interface AuthRequest extends Request {
  user?: UserPayload;
}
