import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { checkDatabaseConnection } from "./config/database";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Chào mừng đến với Floria API Backend!");
});

app.use("/api/auth", authRoutes); // Tất cả API xác thực sẽ bắt đầu bằng /api/auth
const startServer = async () => {
  await checkDatabaseConnection();

  app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
  });
};

startServer();
