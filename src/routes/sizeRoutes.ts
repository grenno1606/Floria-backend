import { Router } from "express";
import {
  createSize,
  getSizes,
  updateSize,
  deleteSize,
} from "../controllers/sizeController";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", getSizes);

router.post("/", verifyToken, isAdmin, createSize);
router.put("/:id", verifyToken, isAdmin, updateSize);
router.delete("/:id", verifyToken, isAdmin, deleteSize);

export default router;
