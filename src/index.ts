import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { checkDatabaseConnection } from "./config/database";
import authRoutes from "./routes/authRoutes";
import sizeRoutes from "./routes/sizeRoutes";
import mediaRoutes from "./routes/mediaRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import productRoutes from "./routes/productRoutes";
import favoriteRoutes from "./routes/favoriteRoutes";
import cartRoutes from "./routes/cartRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import customerRoutes from "./routes/customerRoutes";
import blogRoutes from "./routes/blogRoutes";
import path from "path";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req: Request, res: Response) => {
  res.send("Chào mừng đến với Floria API Backend!");
});

app.use("/api/auth", authRoutes);
app.use("/api/sizes", sizeRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/blogs", blogRoutes);

const startServer = async () => {
  await checkDatabaseConnection();

  app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
  });
};

startServer();
