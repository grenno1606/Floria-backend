import { Response } from "express";
import pool from "../config/database";
import { AuthRequest } from "../types/express";
import { RowDataPacket } from "mysql2";

export const addToCart = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.user_id;
    const { variant_id, quantity } = req.body;

    const [variant] = await pool.execute<RowDataPacket[]>(
      "SELECT quantity FROM product_variants WHERE variant_id = ?",
      [variant_id],
    );

    if (!variant.length || variant[0].quantity < quantity) {
      res.status(400).json({
        message: "Sản phẩm không đủ số lượng trong kho",
      });
      return;
    }

    const query = `
      INSERT INTO user_cart (user_id, variant_id, quantity) 
      VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    `;

    await pool.execute(query, [userId, variant_id, quantity]);

    res.status(200).json({
      message: "Đã thêm vào giỏ hàng",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi thêm vào giỏ hàng",
      error,
    });
  }
};

export const getCart = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.user_id;

    const query = `
      SELECT c.cart_id, 
             c.quantity as cart_quantity, 
             pv.variant_id, 
             pv.price, 
             pv.discount_price, 
             pv.quantity as stock_quantity,
             s.size_name, 
             p.product_name, 
             p.slug,
             (
               SELECT media_url 
               FROM media m
               JOIN product_media pm 
               ON m.media_id = pm.media_id
               WHERE pm.product_id = p.product_id
               LIMIT 1
             ) as thumbnail
      FROM user_cart c
      JOIN product_variants pv 
        ON c.variant_id = pv.variant_id
      JOIN products p 
        ON pv.product_id = p.product_id
      LEFT JOIN sizes s 
        ON pv.size_id = s.size_id
      WHERE c.user_id = ?
    `;

    const [cartItems] = await pool.execute<RowDataPacket[]>(query, [userId]);

    res.status(200).json({
      data: cartItems,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy giỏ hàng",
      error,
    });
  }
};

export const removeFromCart = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = req.user.user_id;
    const cartId = req.params.id;

    await pool.execute(
      "DELETE FROM user_cart WHERE cart_id = ? AND user_id = ?",
      [cartId, userId],
    );

    res.status(200).json({
      message: "Đã xóa khỏi giỏ hàng",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi xóa khỏi giỏ",
      error,
    });
  }
};
