import pool from "../config/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export const findUserByEmail = async (email: string) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email],
  );
  return rows[0];
};

export const findUserById = async (id: number) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT user_id, username, email, role, is_active, created_at FROM users WHERE user_id = ?",
    [id],
  );
  return rows[0];
};

export const createUser = async (user: any) => {
  const {
    username,
    email,
    password,
    auth_provider = "local",
    google_id = null,
  } = user;
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO users (username, email, password, auth_provider, google_id) VALUES (?, ?, ?, ?, ?)",
    [username, email, password, auth_provider, google_id],
  );
  return result.insertId;
};
