import { Request, Response } from "express";
import pool from "../config/database";
import { ResultSetHeader } from "mysql2";

export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const connection = await pool.getConnection();

  try {
    const { product_name, description, slug, categories, media_ids, variants } =
      req.body;

    await connection.beginTransaction();

    const [prodResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO products (product_name, description, slug) VALUES (?, ?, ?)",
      [product_name, description, slug],
    );
    const productId = prodResult.insertId;

    if (categories && categories.length > 0) {
      for (const categoryId of categories) {
        await connection.execute(
          "INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)",
          [productId, categoryId],
        );
      }
    }

    if (media_ids && media_ids.length > 0) {
      for (const mediaId of media_ids) {
        await connection.execute(
          "INSERT INTO product_media (product_id, media_id) VALUES (?, ?)",
          [productId, mediaId],
        );
      }
    }

    if (variants && variants.length > 0) {
      for (const variant of variants) {
        await connection.execute(
          "INSERT INTO product_variants (product_id, size_id, price, discount_price, quantity) VALUES (?, ?, ?, ?, ?)",
          [
            productId,
            variant.size_id,
            variant.price,
            variant.discount_price,
            variant.quantity,
          ],
        );
      }
    }

    await connection.commit();
    res
      .status(201)
      .json({ message: "Thêm sản phẩm thành công", product_id: productId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Lỗi thêm sản phẩm, đã rollback", error });
  } finally {
    connection.release();
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const productId = req.params.id;
    await pool.execute(
      "UPDATE products SET is_active = FALSE WHERE product_id = ?",
      [productId],
    );
    res.status(200).json({ message: "Đã ẩn sản phẩm thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi ẩn sản phẩm", error });
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      search,
      category_id,
      min_price,
      max_price,
      page = "1",
      limit = "10",
    } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT p.product_id, p.product_name, p.slug, p.view_count,
             MIN(m.media_url) as thumbnail, 
             MIN(pv.price) as starting_price
      FROM products p
      LEFT JOIN product_media pm ON p.product_id = pm.product_id
      LEFT JOIN media m ON pm.media_id = m.media_id
      LEFT JOIN product_variants pv ON p.product_id = pv.product_id
      LEFT JOIN product_categories pc ON p.product_id = pc.product_id
      WHERE p.is_active = TRUE
    `;

    const queryParams: any[] = [];

    if (search) {
      query += ` AND p.product_name LIKE ?`;
      queryParams.push(`%${search}%`);
    }

    if (category_id) {
      query += ` AND pc.category_id = ?`;
      queryParams.push(Number(category_id));
    }

    if (min_price) {
      query += ` AND pv.price >= ?`;
      queryParams.push(Number(min_price));
    }
    if (max_price) {
      query += ` AND pv.price <= ?`;
      queryParams.push(Number(max_price));
    }

    query += ` GROUP BY p.product_id LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), Number(offset));

    const [products] = await pool.query(query, queryParams);
    res.status(200).json({ data: products, page: Number(page) });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm", error });
  }
};

export const getProductDetail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { slug } = req.params;

    const [products]: any = await pool.execute(
      "SELECT * FROM products WHERE slug = ? AND is_active = TRUE",
      [slug],
    );

    if (!products.length) {
      res.status(404).json({ message: "Sản phẩm không tồn tại hoặc đã bị ẩn" });
      return;
    }
    const product = products[0];
    const productId = product.product_id;

    const [variantsData, mediaData, categoriesData] = await Promise.all([
      pool.execute(
        `SELECT pv.variant_id, pv.price, pv.discount_price, pv.quantity, s.size_name 
         FROM product_variants pv 
         LEFT JOIN sizes s ON pv.size_id = s.size_id 
         WHERE pv.product_id = ?`,
        [productId],
      ),

      pool.execute(
        `SELECT m.media_id, m.media_type, m.media_url 
         FROM product_media pm 
         JOIN media m ON pm.media_id = m.media_id 
         WHERE pm.product_id = ?`,
        [productId],
      ),

      pool.execute(
        `SELECT c.category_id, c.category_name, c.slug 
         FROM product_categories pc 
         JOIN categories c ON pc.category_id = c.category_id 
         WHERE pc.product_id = ?`,
        [productId],
      ),
    ]);

    await pool.execute(
      "UPDATE products SET view_count = view_count + 1 WHERE product_id = ?",
      [productId],
    );

    res.status(200).json({
      ...product,
      view_count: product.view_count + 1,
      categories: categoriesData[0],
      media: mediaData[0],
      variants: variantsData[0],
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy chi tiết sản phẩm", error });
  }
};
