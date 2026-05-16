import { Request, Response } from "express";
import pool from "../config/database";
import { ResultSetHeader } from "mysql2";

export const uploadMedia = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Vui lòng chọn một file" });
      return;
    }

    const mediaUrl = `/uploads/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";

    const [dbResult] = await pool.execute<ResultSetHeader>(
      "INSERT INTO media (media_type, media_url) VALUES (?, ?)",
      [mediaType, mediaUrl],
    );

    res.status(201).json({
      message: "Tải lên thành công",
      media_id: dbResult.insertId,
      url: mediaUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi upload ảnh", error });
  }
};
