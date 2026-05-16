import { Router } from "express";
import { uploadMedia } from "../controllers/mediaController";
import { uploadLocal } from "../middlewares/uploadMiddleware"; // Đã tạo ở phần trước
import { verifyToken, isAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.post(
  "/upload",
  verifyToken,
  isAdmin,
  uploadLocal.single("image"),
  uploadMedia,
);

export default router;
