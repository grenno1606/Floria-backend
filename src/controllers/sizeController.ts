import { Request, Response } from "express";
import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const createSize = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { size_name } = req.body;

    if (!size_name) {
      res.status(400).json({ message: "Tên kích thước không được để trống" });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO sizes (size_name) VALUES (?)",
      [size_name],
    );
    res.status(201).json({
      message: "Tạo kích thước thành công",
      size_id: result.insertId,
    });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ message: "Kích thước này đã tồn tại" });
      return;
    }
    res.status(500).json({ message: "Lỗi tạo kích thước", error });
  }
};

export const getSizes = async (req: Request, res: Response): Promise<void> => {
  try {
    const [sizes] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM sizes ORDER BY created_at DESC",
    );
    res.status(200).json({ data: sizes });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách kích thước", error });
  }
};

export const updateSize = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const sizeId = req.params.id;
    const { size_name } = req.body;

    if (!size_name) {
      res.status(400).json({ message: "Tên kích thước không được để trống" });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE sizes SET size_name = ? WHERE size_id = ?",
      [size_name, sizeId],
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Không tìm thấy kích thước này" });
      return;
    }

    res.status(200).json({ message: "Cập nhật kích thước thành công" });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ message: "Tên kích thước này đã tồn tại" });
      return;
    }
    res.status(500).json({ message: "Lỗi cập nhật kích thước", error });
  }
};

export const deleteSize = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const sizeId = req.params.id;

    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM sizes WHERE size_id = ?",
      [sizeId],
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Không tìm thấy kích thước để xóa" });
      return;
    }

    res.status(200).json({ message: "Xóa kích thước thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa kích thước", error });
  }
};
