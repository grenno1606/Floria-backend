import { Response } from "express";
import pool from "../config/database";
import { AuthRequest } from "../types/express";
import { RowDataPacket } from "mysql2";

export const toggleFavorite = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.user_id;
    const { product_id } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!product_id) {
      res.status(400).json({ message: "product_id is required" });
      return;
    }

    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT favorite_id FROM favorite_products WHERE user_id = ? AND product_id = ?",
      [userId, product_id],
    );

    if (existing.length > 0) {
      await pool.execute(
        "DELETE FROM favorite_products WHERE user_id = ? AND product_id = ?",
        [userId, product_id],
      );
      res.status(200).json({ message: "Đã bỏ yêu thích sản phẩm" });
    } else {
      await pool.execute(
        "INSERT INTO favorite_products (user_id, product_id) VALUES (?, ?)",
        [userId, product_id],
      );
      res.status(201).json({ message: "Đã thêm vào danh sách yêu thích" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi xử lý yêu thích", error });
  }
};

export const getFavorites = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const query = `
      SELECT p.product_id, p.product_name, p.slug, MIN(m.media_url) as thumbnail, f.created_at
      FROM favorite_products f
      JOIN products p ON f.product_id = p.product_id
      LEFT JOIN product_media pm ON p.product_id = pm.product_id
      LEFT JOIN media m ON pm.media_id = m.media_id
      WHERE f.user_id = ?
      GROUP BY p.product_id, f.created_at
      ORDER BY f.created_at DESC
    `;
    const [favorites] = await pool.execute<RowDataPacket[]>(query, [userId]);
    res.status(200).json({ data: favorites });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách yêu thích", error });
  }
};
