import { Router } from "express";
import {
  getBlogs,
  getBlogDetail,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", getBlogs);
router.get("/:slug", getBlogDetail);

router.post("/", verifyToken, isAdmin, createBlog);
router.put("/:id", verifyToken, isAdmin, updateBlog);
router.delete("/:id", verifyToken, isAdmin, deleteBlog);

export default router;
