import { Router } from "express";
import {
  addReview,
  getReviewsByProduct,
} from "../controllers/reviewController";
import { verifyToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", verifyToken, addReview);
router.get("/:productId", getReviewsByProduct);

export default router;
