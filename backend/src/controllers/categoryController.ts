import { Request, Response, NextFunction } from "express";
import { db } from "../config/db";
import { AppError } from "../utils/AppError";
import { Category } from "../types/category";

function parsePagination(req: Request) {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const offset = (page - 1) * limit;

    return { page, limit, offset };
}

export async function getCategories(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { page, limit, offset } = parsePagination(req);

        const [rows] = await db.query(
            `
                SELECT
                    c.id,
                    c.name,
                    c.description,
                    c.created_at,
                    c.updated_at,
                    COUNT(n.id) AS news_count
                FROM categories c
                         LEFT JOIN news n ON n.category_id = c.id
                GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at
                ORDER BY c.created_at DESC
                    LIMIT ? OFFSET ?
      `,
            [limit, offset]
        );

        const [countRows] = await db.query(
            `
      SELECT COUNT(*) AS total
      FROM categories
      `
        );

        const total = (countRows as { total: number }[])[0].total;

        return res.json({
            items: rows,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
}

export async function getCategoryById(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const categoryId = Number(req.params.id);

        if (!categoryId) {
            throw new AppError("Invalid category id.", 400);
        }

        const [rows] = await db.query(
            `
      SELECT id, name, description, created_at, updated_at
      FROM categories
      WHERE id = ?
      `,
            [categoryId]
        );

        const categories = rows as Category[];

        if (categories.length === 0) {
            throw new AppError("Category not found.", 404);
        }

        return res.json({
            category: categories[0]
        });
    } catch (error) {
        next(error);
    }
}

export async function createCategory(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { name, description } = req.body;

        if (!name || !String(name).trim()) {
            throw new AppError("Category name is required.", 400);
        }

        if (!description || !String(description).trim()) {
            throw new AppError("Category description is required.", 400);
        }

        const normalizedName = String(name).trim();
        const normalizedDescription = String(description).trim();

        const [existingRows] = await db.query(
            `
      SELECT id
      FROM categories
      WHERE name = ?
      `,
            [normalizedName]
        );

        if ((existingRows as { id: number }[]).length > 0) {
            throw new AppError("Category with this name already exists.", 409);
        }

        const [result] = await db.query(
            `
      INSERT INTO categories (name, description)
      VALUES (?, ?)
      `,
            [normalizedName, normalizedDescription]
        );

        const insertResult = result as { insertId: number };

        return res.status(201).json({
            message: "Category created successfully.",
            category: {
                id: insertResult.insertId,
                name: normalizedName,
                description: normalizedDescription
            }
        });
    } catch (error) {
        next(error);
    }
}

export async function updateCategory(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const categoryId = Number(req.params.id);
        const { name, description } = req.body;

        if (!categoryId) {
            throw new AppError("Invalid category id.", 400);
        }

        if (!name || !String(name).trim()) {
            throw new AppError("Category name is required.", 400);
        }

        if (!description || !String(description).trim()) {
            throw new AppError("Category description is required.", 400);
        }

        const normalizedName = String(name).trim();
        const normalizedDescription = String(description).trim();

        const [categoryRows] = await db.query(
            `
      SELECT id
      FROM categories
      WHERE id = ?
      `,
            [categoryId]
        );

        if ((categoryRows as { id: number }[]).length === 0) {
            throw new AppError("Category not found.", 404);
        }

        const [duplicateRows] = await db.query(
            `
      SELECT id
      FROM categories
      WHERE name = ? AND id <> ?
      `,
            [normalizedName, categoryId]
        );

        if ((duplicateRows as { id: number }[]).length > 0) {
            throw new AppError("Category with this name already exists.", 409);
        }

        await db.query(
            `
      UPDATE categories
      SET name = ?, description = ?
      WHERE id = ?
      `,
            [normalizedName, normalizedDescription, categoryId]
        );

        return res.json({
            message: "Category updated successfully."
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteCategory(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const categoryId = Number(req.params.id);

        if (!categoryId) {
            throw new AppError("Invalid category id.", 400);
        }

        const [categoryRows] = await db.query(
            `
      SELECT id
      FROM categories
      WHERE id = ?
      `,
            [categoryId]
        );

        if ((categoryRows as { id: number }[]).length === 0) {
            throw new AppError("Category not found.", 404);
        }

        const [newsRows] = await db.query(
            `
      SELECT id
      FROM news
      WHERE category_id = ?
      LIMIT 1
      `,
            [categoryId]
        );

        if ((newsRows as { id: number }[]).length > 0) {
            throw new AppError("Cannot delete category because it contains news.", 409);
        }

        await db.query(
            `
      DELETE FROM categories
      WHERE id = ?
      `,
            [categoryId]
        );

        return res.json({
            message: "Category deleted successfully."
        });
    } catch (error) {
        next(error);
    }
}