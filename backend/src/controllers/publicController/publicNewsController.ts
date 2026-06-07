import {NextFunction, Request, Response} from "express";
import {AppError} from "../../utils/AppError";
import {db} from "../../config/db";
import {NewsListItem} from "../../types/news";
import { getRelatedNewsByTags,getTopReactedNewsItems } from "../../utils/ControllerHelperFuncs";

import {
    getCommentsForNews,
    getNewsReactionCounts,
    getTagsForNews,
    registerNewsView
} from "../../utils/ControllerHelperFuncs";
import {parsePagination} from "../../utils/pagination";

//VEsti po idju
export async function getPublicNewsById(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const newsId = Number(req.params.id);

        if (!newsId) {
            throw new AppError("Invalid news id.", 400);
        }

        const [initialRows] = await db.query(
            `
                SELECT id
                FROM news
                WHERE id = ?
            `,
            [newsId]
        );

        if ((initialRows as { id: number }[]).length === 0) {
            throw new AppError("News not found.", 404);
        }

        if (!req.visitorId) {
            throw new AppError("Visitor session is missing.", 500);
        }

        await registerNewsView(newsId, req.visitorId);

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
      WHERE n.id = ?
      `,
            [newsId]
        );

        const newsRows = rows as NewsListItem[];

        const tags = await getTagsForNews(newsId);
        const comments = await getCommentsForNews(newsId);
        const reactions = await getNewsReactionCounts(newsId);

        return res.json({
            news: {
                ...newsRows[0],
                tags,
                comments,
                reactions
            }
        });
    } catch (error) {
        next(error);
    }
}

//Najnovije
export async function getLatestNews(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
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
      ORDER BY n.published_at DESC
      LIMIT 10
      `
        );

        return res.json({
            items: rows as NewsListItem[]
        });
    } catch (error) {
        next(error);
    }
}

//Najcitanije
export async function getMostReadNews(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
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
      WHERE n.published_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY n.visit_count DESC, n.published_at DESC
      LIMIT 10
      `
        );

        return res.json({
            items: rows as NewsListItem[]
        });
    } catch (error) {
        next(error);
    }
}

export async function searchPublicNews(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const q = String(req.query.q || "").trim();

        if (!q) {
            throw new AppError("Search query is required.", 400);
        }

        const { page, limit, offset } = parsePagination(req);
        const searchValue = `%${q}%`;

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
      WHERE n.title LIKE ? OR n.text LIKE ?
      ORDER BY n.published_at DESC
      LIMIT ? OFFSET ?
      `,
            [searchValue, searchValue, limit, offset]
        );

        const [countRows] = await db.query(
            `
      SELECT COUNT(*) AS total
      FROM news n
      WHERE n.title LIKE ? OR n.text LIKE ?
      `,
            [searchValue, searchValue]
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

//Slicne vesti po tagu
export async function getRelatedNews(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const newsId = Number(req.params.id);

        if (!newsId) {
            throw new AppError("Invalid news id.", 400);
        }

        const [newsRows] = await db.query(
            `
      SELECT id
      FROM news
      WHERE id = ?
      `,
            [newsId]
        );

        if ((newsRows as { id: number }[]).length === 0) {
            throw new AppError("News not found.", 404);
        }

        const relatedNews = await getRelatedNewsByTags(newsId);

        return res.json({
            items: relatedNews
        });
    } catch (error) {
        next(error);
    }
}

//Vesti sa najvise reakcija
export async function getTopReactedNews(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const items = await getTopReactedNewsItems();

        return res.json({
            items
        });
    } catch (error) {
        next(error);
    }
}

