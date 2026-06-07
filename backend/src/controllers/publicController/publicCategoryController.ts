import {NextFunction, Request, Response} from "express";
import {db} from "../../config/db";
import {AppError} from "../../utils/AppError";
import {NewsListItem} from "../../types/news";
import {parsePagination} from "../../utils/pagination";

//Javne kategorije
export async function getPublicCategories(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const [rows] = await db.query(
            `
      SELECT id, name, description
      FROM categories
      ORDER BY name ASC
      `
        );

        return res.json({
            items: rows
        });
    } catch (error) {
        next(error);
    }
}

//Vesti po kategoriji
export async function getNewsByCategory(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const categoryId = Number(req.params.id);

        if (!categoryId) {
            throw new AppError("Invalid category id.", 400);
        }

        const { page, limit, offset } = parsePagination(req);

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

        const [rows] = await db.query(
            `
      SELECT 
        n.id,
        n.title,
        n.text,
        n.published_at,
        n.visit_count,
        n.author_id,
        u.first_name AS author_first_name,
        u.last_name AS author_last_name,
        n.category_id,
        c.name AS category_name
      FROM news n
      INNER JOIN users u ON u.id = n.author_id
      INNER JOIN categories c ON c.id = n.category_id
      WHERE n.category_id = ?
      ORDER BY n.published_at DESC
      LIMIT ? OFFSET ?
      `,
            [categoryId, limit, offset]
        );

        const [countRows] = await db.query(
            `
      SELECT COUNT(*) AS total
      FROM news
      WHERE category_id = ?
      `,
            [categoryId]
        );

        const total = (countRows as { total: number }[])[0].total;

        return res.json({
            items: rows as NewsListItem[],
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
}