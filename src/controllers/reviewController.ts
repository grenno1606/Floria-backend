import { Response, Request } from "express";
import pool from "../config/database";
import { AuthRequest } from "../types/express";
import { RowDataPacket } from "mysql2";

export const addReview = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const connection = await pool.getConnection();
  try {
    const userId = req.user?.user_id;
    const { product_id, rating, review_text, media_ids } = req.body;

    if (rating < 1 || rating > 5) {
      res.status(400).json({ message: "Đánh giá phải từ 1 đến 5 sao" });
      return;
    }

    await connection.beginTransaction();

    const [reviewResult]: any = await connection.execute(
      "INSERT INTO reviews (product_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)",
      [product_id, userId, rating, review_text],
    );
    const reviewId = reviewResult.insertId;

    if (media_ids && media_ids.length > 0) {
      for (const mediaId of media_ids) {
        await connection.execute(
          "INSERT INTO review_media (review_id, media_id) VALUES (?, ?)",
          [reviewId, mediaId],
        );
      }
    }

    await connection.commit();
    res.status(201).json({ message: "Cảm ơn bạn đã đánh giá!" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Lỗi gửi đánh giá", error });
  } finally {
    connection.release();
  }
};

export const getReviewsByProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const productId = req.params.productId;

    const query = `
      SELECT r.review_id, r.rating, r.review_text, r.created_at, u.username,
             GROUP_CONCAT(m.media_url) as media_urls
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      LEFT JOIN review_media rm ON r.review_id = rm.review_id
      LEFT JOIN media m ON rm.media_id = m.media_id
      WHERE r.product_id = ?
      GROUP BY r.review_id
      ORDER BY r.created_at DESC
    `;

    const [reviews] = await pool.execute<RowDataPacket[]>(query, [productId]);

    const formattedReviews = reviews.map((review) => ({
      ...review,
      media_urls: review.media_urls ? review.media_urls.split(",") : [],
    }));

    res.status(200).json({ data: formattedReviews });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách đánh giá", error });
  }
};
