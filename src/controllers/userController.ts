import { Response } from "express";
import { AuthRequest } from "../types/express";
import * as userModel from "../models/userModel";

export const getProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      res.status(401).json({ message: "Không tìm thấy ID người dùng" });
      return;
    }

    const user = await userModel.findUserById(userId);
    res.status(200).json({ profile: user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};
