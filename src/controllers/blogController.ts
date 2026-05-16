import { Request, Response } from "express";
import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { AuthRequest } from "../types/express";

export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const [blogs] = await pool.execute<RowDataPacket[]>(
      "SELECT post_id, title, image, slug, published_date FROM blog_posts ORDER BY published_date DESC",
    );
    res.status(200).json({ data: blogs });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách bài viết", error });
  }
};

export const getBlogDetail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { slug } = req.params;
    const [blogs] = await pool.execute<RowDataPacket[]>(
      `SELECT b.*, u.username as author_name 
       FROM blog_posts b 
       LEFT JOIN users u ON b.author_id = u.user_id 
       WHERE b.slug = ?`,
      [slug],
    );

    if (!blogs.length) {
      res.status(404).json({ message: "Không tìm thấy bài viết" });
      return;
    }
    res.status(200).json({ data: blogs[0] });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy chi tiết bài viết", error });
  }
};

export const createBlog = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const authorId = req.user?.user_id;
    const { title, content, image, slug, published_date } = req.body;

    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO blog_posts (title, content, image, slug, published_date, author_id) VALUES (?, ?, ?, ?, ?, ?)",
      [title, content, image, slug, published_date, authorId],
    );

    res
      .status(201)
      .json({ message: "Tạo bài viết thành công", post_id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo bài viết", error });
  }
};

export const updateBlog = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const postId = req.params.id;
    const { title, content, image, slug, published_date } = req.body;

    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE blog_posts SET title = ?, content = ?, image = ?, slug = ?, published_date = ? WHERE post_id = ?",
      [title, content, image, slug, published_date, postId],
    );

    if (result.affectedRows === 0) {
      res
        .status(404)
        .json({ message: "Không tìm thấy bài viết này để cập nhật" });
      return;
    }

    res.status(200).json({ message: "Cập nhật bài viết thành công" });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({
        message: "Đường dẫn (slug) này đã tồn tại, vui lòng chọn tên khác",
      });
      return;
    }
    res.status(500).json({ message: "Lỗi cập nhật bài viết", error });
  }
};

export const deleteBlog = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const postId = req.params.id;

    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM blog_posts WHERE post_id = ?",
      [postId],
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Không tìm thấy bài viết để xóa" });
      return;
    }

    res.status(200).json({ message: "Xóa bài viết thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa bài viết", error });
  }
};
