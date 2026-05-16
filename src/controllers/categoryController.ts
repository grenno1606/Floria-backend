import { Request, Response } from "express";
import pool from "../config/database";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export const createCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { category_name, slug } = req.body;
    await pool.execute(
      "INSERT INTO categories (category_name, slug) VALUES (?, ?)",
      [category_name, slug],
    );
    res.status(201).json({ message: "Tạo danh mục thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo danh mục", error });
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const [categories] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM categories",
    );
    res.status(200).json({ data: categories });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh mục", error });
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categoryId = req.params.id;
    const { category_name, slug } = req.body;

    if (!category_name || !slug) {
      res
        .status(400)
        .json({ message: "Tên danh mục và slug không được để trống" });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE categories SET category_name = ?, slug = ? WHERE category_id = ?",
      [category_name, slug, categoryId],
    );

    if (result.affectedRows === 0) {
      res
        .status(404)
        .json({ message: "Không tìm thấy danh mục này để cập nhật" });
      return;
    }

    res.status(200).json({ message: "Cập nhật danh mục thành công" });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      res
        .status(400)
        .json({ message: "Tên danh mục hoặc slug này đã tồn tại" });
      return;
    }
    res.status(500).json({ message: "Lỗi cập nhật danh mục", error });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categoryId = req.params.id;

    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM categories WHERE category_id = ?",
      [categoryId],
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Không tìm thấy danh mục để xóa" });
      return;
    }

    res.status(200).json({ message: "Xóa danh mục thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa danh mục", error });
  }
};
