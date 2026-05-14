import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, UserPayload } from "../types/express";

// Middleware 1: Kiểm tra đăng nhập (Xác thực Token)
export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ message: "Không có token, quyền truy cập bị từ chối" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as UserPayload;
    req.user = decoded; // Gắn thông tin giải mã vào req
    next(); // Cho phép đi tiếp vào controller
  } catch (error) {
    res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

// Middleware 2: Kiểm tra quyền Admin
export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Yêu cầu quyền Quản trị viên (Admin)" });
  }
};
