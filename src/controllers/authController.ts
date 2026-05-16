import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import * as userModel from "../models/userModel";
import { generateToken } from "../utils/jwtHelper";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: "Email đã được sử dụng!" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertId = await userModel.createUser({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Đăng ký thành công!", user_id: insertId });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findUserByEmail(email);
    if (!user || user.auth_provider !== "local") {
      res.status(401).json({ message: "Email hoặc mật khẩu không đúng!" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Email hoặc mật khẩu không đúng!" });
      return;
    }

    const token = generateToken({ user_id: user.user_id, role: user.role });
    res.status(200).json({ message: "Đăng nhập thành công", token });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
    console.error("Login error:", error);
  }
};

export const googleLogin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { idToken } = req.body;

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      res.status(400).json({ message: "Token Google không hợp lệ" });
      return;
    }

    const { email, name, sub: google_id } = payload;

    const user = await userModel.findUserByEmail(email);

    let tokenPayload: { user_id: number; role: "user" | "admin" };

    if (!user) {
      const insertId = await userModel.createUser({
        username: name || "Google User",
        email,
        password: null,
        auth_provider: "google",
        google_id,
      });

      tokenPayload = { user_id: insertId, role: "user" };
    } else {
      tokenPayload = { user_id: user.user_id, role: user.role };
    }

    const token = generateToken(tokenPayload);
    res.status(200).json({ message: "Đăng nhập Google thành công", token });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};
