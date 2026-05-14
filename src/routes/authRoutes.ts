import { Router } from "express";
import { register, login, googleLogin } from "../controllers/authController";
import { getProfile } from "../controllers/userController";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware";

const router = Router();

// Public Routes (Không cần token)
router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);

// Protected Routes (Cần đăng nhập)
router.get("/profile", verifyToken, getProfile);

// Ví dụ Admin Route (Cần đăng nhập VÀ phải là admin)
router.get("/admin/stats", verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Chào mừng Admin, đây là dữ liệu mật" });
});

export default router;
