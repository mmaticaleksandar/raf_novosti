import { Request, Response, NextFunction } from "express";
import { ResultSetHeader } from "mysql2";
import { db } from "../config/db";
import { AppError } from "../utils/AppError";
import { News, NewsListItem } from "../types/news";

function parsePagination(req: Request) {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const offset = (page - 1) * limit;

    return { page, limit, offset };
}

function parseTags(tagsInput: unknown): string[] {
    if (!tagsInput) {
        return [];
    }

    if (Array.isArray(tagsInput)) {
        return tagsInput
            .map((tag) => String(tag).trim())
            .filter((tag) => tag.length > 0);
    }

    return String(tagsInput)
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
}

async function getOrCreateTagId(name: string): Promise<number> {
    const [existingRows] = await db.query(
        `
    SELECT id
    FROM tags
    WHERE name = ?
    `,
        [name]
    );

    const existingTags = existingRows as { id: number }[];

    if (existingTags.length > 0) {
        return existingTags[0].id;
    }

    const [insertResult] = await db.query<ResultSetHeader>(
        `
    INSERT INTO tags (name)
    VALUES (?)
    `,
        [name]
    );

    return insertResult.insertId;
}

async function replaceNewsTags(newsId: number, tags: string[]) {
    await db.query(
        `
    DELETE FROM news_tags
    WHERE news_id = ?
    `,
        [newsId]
    );

    for (const tag of tags) {
        const tagId = await getOrCreateTagId(tag);

        await db.query(
            `
      INSERT IGNORE INTO news_tags (news_id, tag_id)
      VALUES (?, ?)
      `,
            [newsId, tagId]
        );
    }
}

async function getTagsForNews(newsId: number): Promise<string[]> {
    const [rows] = await db.query(
        `
    SELECT t.name
    FROM tags t
    INNER JOIN news_tags nt ON nt.tag_id = t.id
    WHERE nt.news_id = ?
    ORDER BY t.name ASC
    `,
        [newsId]
    );

    return (rows as { name: string }[]).map((row) => row.name);
}

async function ensureCategoryExists(categoryId: number) {
    const [rows] = await db.query(
        `
    SELECT id
    FROM categories
    WHERE id = ?
    `,
        [categoryId]
    );

    if ((rows as { id: number }[]).length === 0) {
        throw new AppError("Category not found.", 404);
    }
}

async function getNewsOwner(newsId: number): Promise<number | null> {
    const [rows] = await db.query(
        `
    SELECT author_id
    FROM news
    WHERE id = ?
    `,
        [newsId]
    );

    const newsRows = rows as { author_id: number }[];

    if (newsRows.length === 0) {
        return null;
    }

    return newsRows[0].author_id;
}

function ensureCanModifyNews(req: Request, authorId: number) {
    if (!req.user) {
        throw new AppError("User is not authenticated.", 401);
    }

    if (req.user.role === "ADMIN") {
        return;
    }

    if (req.user.id !== authorId) {
        throw new AppError("You can modify only your own news.", 403);
    }
}

export async function getNewsList(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { page, limit, offset } = parsePagination(req);
        const categoryId = req.query.categoryId ? Number(req.query.categoryId) : null;

        if (req.query.categoryId && !categoryId) {
            throw new AppError("Invalid category id.", 400);
        }

        const whereParts: string[] = [];
        const params: Array<string | number> = [];

        if (categoryId) {
            whereParts.push("n.category_id = ?");
            params.push(categoryId);
        }

        const whereSql = whereParts.length > 0
            ? `WHERE ${whereParts.join(" AND ")}`
            : "";

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
      ${whereSql}
      ORDER BY n.published_at DESC
      LIMIT ? OFFSET ?
      `,
            [...params, limit, offset]
        );

        const [countRows] = await db.query(
            `
      SELECT COUNT(*) AS total
      FROM news n
      ${whereSql}
      `,
            params
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

export async function searchNews(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const { page, limit, offset } = parsePagination(req);
        const q = String(req.query.q || "").trim();

        if (!q) {
            throw new AppError("Search query is required.", 400);
        }

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

export async function getNewsById(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const newsId = Number(req.params.id);

        if (!newsId) {
            throw new AppError("Invalid news id.", 400);
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
      WHERE n.id = ?
      `,
            [newsId]
        );

        const newsRows = rows as NewsListItem[];

        if (newsRows.length === 0) {
            throw new AppError("News not found.", 404);
        }

        const tags = await getTagsForNews(newsId);

        return res.json({
            news: {
                ...newsRows[0],
                tags
            }
        });
    } catch (error) {
        next(error);
    }
}

export async function createNews(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        if (!req.user) {
            throw new AppError("User is not authenticated.", 401);
        }

        const { title, text, categoryId, tags } = req.body;

        if (!title || !String(title).trim()) {
            throw new AppError("News title is required.", 400);
        }

        if (!text || !String(text).trim()) {
            throw new AppError("News text is required.", 400);
        }

        const parsedCategoryId = Number(categoryId);

        if (!parsedCategoryId) {
            throw new AppError("Category is required.", 400);
        }

        await ensureCategoryExists(parsedCategoryId);

        const normalizedTitle = String(title).trim();
        const normalizedText = String(text).trim();
        const parsedTags = parseTags(tags);

        const [result] = await db.query<ResultSetHeader>(
            `
      INSERT INTO news (title, text, author_id, category_id)
      VALUES (?, ?, ?, ?)
      `,
            [normalizedTitle, normalizedText, req.user.id, parsedCategoryId]
        );

        const newsId = result.insertId;

        await replaceNewsTags(newsId, parsedTags);

        return res.status(201).json({
            message: "News created successfully.",
            news: {
                id: newsId,
                title: normalizedTitle,
                text: normalizedText,
                categoryId: parsedCategoryId,
                authorId: req.user.id,
                tags: parsedTags
            }
        });
    } catch (error) {
        next(error);
    }
}

export async function updateNews(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const newsId = Number(req.params.id);

        if (!newsId) {
            throw new AppError("Invalid news id.", 400);
        }

        const ownerId = await getNewsOwner(newsId);

        if (!ownerId) {
            throw new AppError("News not found.", 404);
        }

        ensureCanModifyNews(req, ownerId);

        const { title, text, categoryId, tags } = req.body;

        if (!title || !String(title).trim()) {
            throw new AppError("News title is required.", 400);
        }

        if (!text || !String(text).trim()) {
            throw new AppError("News text is required.", 400);
        }

        const parsedCategoryId = Number(categoryId);

        if (!parsedCategoryId) {
            throw new AppError("Category is required.", 400);
        }

        await ensureCategoryExists(parsedCategoryId);

        const normalizedTitle = String(title).trim();
        const normalizedText = String(text).trim();
        const parsedTags = parseTags(tags);

        await db.query(
            `
      UPDATE news
      SET title = ?, text = ?, category_id = ?
      WHERE id = ?
      `,
            [normalizedTitle, normalizedText, parsedCategoryId, newsId]
        );

        await replaceNewsTags(newsId, parsedTags);

        return res.json({
            message: "News updated successfully."
        });
    } catch (error) {
        next(error);
    }
}

export async function deleteNews(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const newsId = Number(req.params.id);

        if (!newsId) {
            throw new AppError("Invalid news id.", 400);
        }

        const ownerId = await getNewsOwner(newsId);

        if (!ownerId) {
            throw new AppError("News not found.", 404);
        }

        ensureCanModifyNews(req, ownerId);

        await db.query(
            `
      DELETE FROM news
      WHERE id = ?
      `,
            [newsId]
        );

        return res.json({
            message: "News deleted successfully."
        });
    } catch (error) {
        next(error);
    }
}