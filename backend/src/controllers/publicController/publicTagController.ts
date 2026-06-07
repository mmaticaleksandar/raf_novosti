import {NextFunction, Request, Response} from "express";
import {AppError} from "../../utils/AppError";
import {db} from "../../config/db";
import {NewsListItem} from "../../types/news";
import {parsePagination} from "../../utils/pagination";

export async function getNewsByTag(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const tagName = String(req.params.tagName || "").trim();

        if (!tagName) {
            throw new AppError("Tag name is required.", 400);
        }

        const { page, limit, offset } = parsePagination(req);

        const [tagRows] = await db.query(
            `
      SELECT id, name
      FROM tags
      WHERE name = ?
      `,
            [tagName]
        );

        const tags = tagRows as { id: number; name: string }[];

        if (tags.length === 0) {
            throw new AppError("Tag not found.", 404);
        }

        const tag = tags[0];

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
      INNER JOIN news_tags nt ON nt.news_id = n.id
      INNER JOIN tags t ON t.id = nt.tag_id
      INNER JOIN users u ON u.id = n.author_id
      INNER JOIN categories c ON c.id = n.category_id
      WHERE t.id = ?
      ORDER BY n.published_at DESC
      LIMIT ? OFFSET ?
      `,
            [tag.id, limit, offset]
        );

        const [countRows] = await db.query(
            `
      SELECT COUNT(*) AS total
      FROM news n
      INNER JOIN news_tags nt ON nt.news_id = n.id
      INNER JOIN tags t ON t.id = nt.tag_id
      WHERE t.id = ?
      `,
            [tag.id]
        );

        const total = (countRows as { total: number }[])[0].total;

        return res.json({
            tag: {
                id: tag.id,
                name: tag.name
            },
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