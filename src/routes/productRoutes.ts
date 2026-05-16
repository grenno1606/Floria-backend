import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductDetail,
  deleteProduct,
} from "../controllers/productController";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", getProducts);

router.get("/:slug", getProductDetail);

router.post("/", verifyToken, isAdmin, createProduct);

router.delete("/:id", verifyToken, isAdmin, deleteProduct);

export default router;
