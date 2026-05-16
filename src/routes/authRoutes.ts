import { Router } from "express";
import { register, login, googleLogin } from "../controllers/authController";
import { getProfile } from "../controllers/userController";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);

router.get("/profile", verifyToken, getProfile);

router.get("/admin/stats", verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Chào mừng Admin, đây là dữ liệu mật" });
});

export default router;
