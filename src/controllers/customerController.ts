import { Request, Response } from "express";
import pool from "../config/database";

export const subscribeNewsletter = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    await pool.execute(
      "INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)",
      [email],
    );
    res.status(200).json({ message: "Đăng ký nhận bản tin thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi đăng ký bản tin", error });
  }
};

export const submitContact = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, message } = req.body;
    await pool.execute(
      "INSERT INTO contact_us (name, email, message) VALUES (?, ?, ?)",
      [name, email, message],
    );
    res
      .status(200)
      .json({ message: "Chúng tôi đã nhận được tin nhắn của bạn" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi gửi liên hệ", error });
  }
};
