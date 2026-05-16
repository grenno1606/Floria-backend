import { Router } from "express";
import {
  toggleFavorite,
  getFavorites,
} from "../controllers/favoriteController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", verifyToken, getFavorites);

router.post("/toggle", verifyToken, toggleFavorite);

export default router;
