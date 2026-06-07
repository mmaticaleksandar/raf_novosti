// import { Request, Response, NextFunction } from "express";
// import { db } from "../config/db";
// import { AppError } from "../utils/AppError";
// import { NewsListItem } from "../types/news";
//
// function parsePagination(req: Request) {
//     const page = Math.max(Number(req.query.page) || 1, 1);
//     const limit = Math.max(Number(req.query.limit) || 10, 1);
//     const offset = (page - 1) * limit;
//
//     return { page, limit, offset };
// }
//
// async function getTagsForNews(newsId: number): Promise<string[]> {
//     const [rows] = await db.query(
//         `
//     SELECT t.name
//     FROM tags t
//     INNER JOIN news_tags nt ON nt.tag_id = t.id
//     WHERE nt.news_id = ?
//     ORDER BY t.name ASC
//     `,
//         [newsId]
//     );
//
//     return (rows as { name: string }[]).map((row) => row.name);
// }
//
//
// //Komentari na objavi
// async function getCommentsForNews(newsId: number) {
//     const [rows] = await db.query(
//         `
//             SELECT
//                 c.id,
//                 c.author_name,
//                 c.text,
//                 c.created_at,
//                 COALESCE(SUM(CASE WHEN cr.reaction_type = 'LIKE' THEN 1 ELSE 0 END), 0) AS likes,
//                 COALESCE(SUM(CASE WHEN cr.reaction_type = 'DISLIKE' THEN 1 ELSE 0 END), 0) AS dislikes
//             FROM comments c
//                      LEFT JOIN comment_reactions cr ON cr.comment_id = c.id
//             WHERE c.news_id = ?
//             GROUP BY c.id, c.author_name, c.text, c.created_at
//             ORDER BY c.created_at DESC
//         `,
//         [newsId]
//     );
//
//     return rows;
// }
//
// export async function getPublicCategories(
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) {
//     try {
//         const [rows] = await db.query(
//             `
//       SELECT id, name, description
//       FROM categories
//       ORDER BY name ASC
//       `
//         );
//
//         return res.json({
//             items: rows
//         });
//     } catch (error) {
//         next(error);
//     }
// }
//
// export async function getLatestNews(
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) {
//     try {
//         const [rows] = await db.query(
//             `
//       SELECT
//         n.id,
//         n.title,
//         n.text,
//         n.published_at,
//         n.visit_count,
//         n.author_id,
//         u.first_name AS author_first_name,
//         u.last_name AS author_last_name,
//         n.category_id,
//         c.name AS category_name
//       FROM news n
//       INNER JOIN users u ON u.id = n.author_id
//       INNER JOIN categories c ON c.id = n.category_id
//       ORDER BY n.published_at DESC
//       LIMIT 10
//       `
//         );
//
//         return res.json({
//             items: rows as NewsListItem[]
//         });
//     } catch (error) {
//         next(error);
//     }
// }
// async function registerNewsView(newsId: number, visitorId: string) {
//     const [existingRows] = await db.query(
//         `
//     SELECT id
//     FROM news_views
//     WHERE news_id = ? AND visitor_id = ?
//     `,
//         [newsId, visitorId]
//     );
//
//     if ((existingRows as { id: number }[]).length > 0) {
//         return;
//     }
//
//     await db.query(
//         `
//     INSERT INTO news_views (news_id, visitor_id)
//     VALUES (?, ?)
//     `,
//         [newsId, visitorId]
//     );
//
//     await db.query(
//         `
//     UPDATE news
//     SET visit_count = visit_count + 1
//     WHERE id = ?
//     `,
//         [newsId]
//     );
// }
//
// //Broj lajkova i dislajkova
// async function getNewsReactionCounts(newsId: number) {
//     const [rows] = await db.query(
//         `
//     SELECT
//       SUM(CASE WHEN reaction_type = 'LIKE' THEN 1 ELSE 0 END) AS likes,
//       SUM(CASE WHEN reaction_type = 'DISLIKE' THEN 1 ELSE 0 END) AS dislikes
//     FROM news_reactions
//     WHERE news_id = ?
//     `,
//         [newsId]
//     );
//
//     const counts = (rows as { likes: number | null; dislikes: number | null }[])[0];
//
//     return {
//         likes: counts.likes || 0,
//         dislikes: counts.dislikes || 0
//     };
// }
// export async function getPublicNewsById(
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) {
//     try {
//         const newsId = Number(req.params.id);
//
//         if (!newsId) {
//             throw new AppError("Invalid news id.", 400);
//         }
//
//         const [initialRows] = await db.query(
//             `
//                 SELECT id
//                 FROM news
//                 WHERE id = ?
//             `,
//             [newsId]
//         );
//
//         if ((initialRows as { id: number }[]).length === 0) {
//             throw new AppError("News not found.", 404);
//         }
//
//         if (!req.visitorId) {
//             throw new AppError("Visitor session is missing.", 500);
//         }
//
//         await registerNewsView(newsId, req.visitorId);
//
//         const [rows] = await db.query(
//             `
//       SELECT
//         n.id,
//         n.title,
//         n.text,
//         n.published_at,
//         n.visit_count,
//         n.author_id,
//         u.first_name AS author_first_name,
//         u.last_name AS author_last_name,
//         n.category_id,
//         c.name AS category_name
//       FROM news n
//       INNER JOIN users u ON u.id = n.author_id
//       INNER JOIN categories c ON c.id = n.category_id
//       WHERE n.id = ?
//       `,
//             [newsId]
//         );
//
//         const newsRows = rows as NewsListItem[];
//
//         const tags = await getTagsForNews(newsId);
//         const comments = await getCommentsForNews(newsId);
//         const reactions = await getNewsReactionCounts(newsId);
//
//         return res.json({
//             news: {
//                 ...newsRows[0],
//                 tags,
//                 comments,
//                 reactions
//             }
//         });
//     } catch (error) {
//         next(error);
//     }
// }
//
// export async function getNewsByCategory(
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) {
//     try {
//         const categoryId = Number(req.params.id);
//
//         if (!categoryId) {
//             throw new AppError("Invalid category id.", 400);
//         }
//
//         const { page, limit, offset } = parsePagination(req);
//
//         const [categoryRows] = await db.query(
//             `
//       SELECT id
//       FROM categories
//       WHERE id = ?
//       `,
//             [categoryId]
//         );
//
//         if ((categoryRows as { id: number }[]).length === 0) {
//             throw new AppError("Category not found.", 404);
//         }
//
//         const [rows] = await db.query(
//             `
//       SELECT
//         n.id,
//         n.title,
//         n.text,
//         n.published_at,
//         n.visit_count,
//         n.author_id,
//         u.first_name AS author_first_name,
//         u.last_name AS author_last_name,
//         n.category_id,
//         c.name AS category_name
//       FROM news n
//       INNER JOIN users u ON u.id = n.author_id
//       INNER JOIN categories c ON c.id = n.category_id
//       WHERE n.category_id = ?
//       ORDER BY n.published_at DESC
//       LIMIT ? OFFSET ?
//       `,
//             [categoryId, limit, offset]
//         );
//
//         const [countRows] = await db.query(
//             `
//       SELECT COUNT(*) AS total
//       FROM news
//       WHERE category_id = ?
//       `,
//             [categoryId]
//         );
//
//         const total = (countRows as { total: number }[])[0].total;
//
//         return res.json({
//             items: rows as NewsListItem[],
//             page,
//             limit,
//             total,
//             totalPages: Math.ceil(total / limit)
//         });
//     } catch (error) {
//         next(error);
//     }
// }
//
// export async function searchPublicNews(
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) {
//     try {
//         const q = String(req.query.q || "").trim();
//
//         if (!q) {
//             throw new AppError("Search query is required.", 400);
//         }
//
//         const { page, limit, offset } = parsePagination(req);
//         const searchValue = `%${q}%`;
//
//         const [rows] = await db.query(
//             `
//       SELECT
//         n.id,
//         n.title,
//         n.text,
//         n.published_at,
//         n.visit_count,
//         n.author_id,
//         u.first_name AS author_first_name,
//         u.last_name AS author_last_name,
//         n.category_id,
//         c.name AS category_name
//       FROM news n
//       INNER JOIN users u ON u.id = n.author_id
//       INNER JOIN categories c ON c.id = n.category_id
//       WHERE n.title LIKE ? OR n.text LIKE ?
//       ORDER BY n.published_at DESC
//       LIMIT ? OFFSET ?
//       `,
//             [searchValue, searchValue, limit, offset]
//         );
//
//         const [countRows] = await db.query(
//             `
//       SELECT COUNT(*) AS total
//       FROM news n
//       WHERE n.title LIKE ? OR n.text LIKE ?
//       `,
//             [searchValue, searchValue]
//         );
//
//         const total = (countRows as { total: number }[])[0].total;
//
//         return res.json({
//             items: rows as NewsListItem[],
//             page,
//             limit,
//             total,
//             totalPages: Math.ceil(total / limit)
//         });
//     } catch (error) {
//         next(error);
//     }
// }
//
// export async function createComment(
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) {
//     try {
//         const newsId = Number(req.params.id);
//         const { authorName, text } = req.body;
//
//         if (!newsId) {
//             throw new AppError("Invalid news id.", 400);
//         }
//
//         if (!authorName || !String(authorName).trim()) {
//             throw new AppError("Comment author name is required.", 400);
//         }
//
//         if (!text || !String(text).trim()) {
//             throw new AppError("Comment text is required.", 400);
//         }
//
//         const [newsRows] = await db.query(
//             `
//       SELECT id
//       FROM news
//       WHERE id = ?
//       `,
//             [newsId]
//         );
//
//         if ((newsRows as { id: number }[]).length === 0) {
//             throw new AppError("News not found.", 404);
//         }
//
//         const normalizedAuthorName = String(authorName).trim();
//         const normalizedText = String(text).trim();
//
//         const [result] = await db.query(
//             `
//       INSERT INTO comments (news_id, author_name, text)
//       VALUES (?, ?, ?)
//       `,
//             [newsId, normalizedAuthorName, normalizedText]
//         );
//
//         const insertResult = result as { insertId: number };
//
//         return res.status(201).json({
//             message: "Comment created successfully.",
//             comment: {
//                 id: insertResult.insertId,
//                 newsId,
//                 authorName: normalizedAuthorName,
//                 text: normalizedText
//             }
//         });
//     } catch (error) {
//         next(error);
//     }
// }
//
// //Najcitanija vest
// export async function getMostReadNews(
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) {
//     try {
//         const [rows] = await db.query(
//             `
//       SELECT
//         n.id,
//         n.title,
//         n.text,
//         n.published_at,
//         n.visit_count,
//         n.author_id,
//         u.first_name AS author_first_name,
//         u.last_name AS author_last_name,
//         n.category_id,
//         c.name AS category_name
//       FROM news n
//       INNER JOIN users u ON u.id = n.author_id
//       INNER JOIN categories c ON c.id = n.category_id
//       WHERE n.published_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
//       ORDER BY n.visit_count DESC, n.published_at DESC
//       LIMIT 10
//       `
//         );
//
//         return res.json({
//             items: rows as NewsListItem[]
//         });
//     } catch (error) {
//         next(error);
//     }
// }
//
// //Like i dislike
// export async function reactToNews(
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) {
//     try {
//         const newsId = Number(req.params.id);
//         const { type } = req.body;
//
//         if (!newsId) {
//             throw new AppError("Invalid news id.", 400);
//         }
//
//         if (type !== "LIKE" && type !== "DISLIKE") {
//             throw new AppError("Reaction type must be LIKE or DISLIKE.", 400);
//         }
//
//         if (!req.visitorId) {
//             throw new AppError("Visitor session is missing.", 500);
//         }
//
//         const [newsRows] = await db.query(
//             `
//       SELECT id
//       FROM news
//       WHERE id = ?
//       `,
//             [newsId]
//         );
//
//         if ((newsRows as { id: number }[]).length === 0) {
//             throw new AppError("News not found.", 404);
//         }
//
//         const [existingRows] = await db.query(
//             `
//       SELECT id, reaction_type
//       FROM news_reactions
//       WHERE news_id = ? AND visitor_id = ?
//       `,
//             [newsId, req.visitorId]
//         );
//
//         const existingReactions = existingRows as {
//             id: number;
//             reaction_type: "LIKE" | "DISLIKE";
//         }[];
//
//         if (existingReactions.length === 0) {
//             await db.query(
//                 `
//         INSERT INTO news_reactions (news_id, visitor_id, reaction_type)
//         VALUES (?, ?, ?)
//         `,
//                 [newsId, req.visitorId, type]
//             );
//         } else {
//             const existingReaction = existingReactions[0];
//
//             if (existingReaction.reaction_type === type) {
//                 await db.query(
//                     `
//           DELETE FROM news_reactions
//           WHERE id = ?
//           `,
//                     [existingReaction.id]
//                 );
//             } else {
//                 await db.query(
//                     `
//           UPDATE news_reactions
//           SET reaction_type = ?
//           WHERE id = ?
//           `,
//                     [type, existingReaction.id]
//                 );
//             }
//         }
//
//         const [countRows] = await db.query(
//             `
//       SELECT
//         SUM(CASE WHEN reaction_type = 'LIKE' THEN 1 ELSE 0 END) AS likes,
//         SUM(CASE WHEN reaction_type = 'DISLIKE' THEN 1 ELSE 0 END) AS dislikes
//       FROM news_reactions
//       WHERE news_id = ?
//       `,
//             [newsId]
//         );
//
//         const counts = (countRows as { likes: number | null; dislikes: number | null }[])[0];
//
//         return res.json({
//             message: "News reaction updated successfully.",
//             reactions: {
//                 likes: counts.likes || 0,
//                 dislikes: counts.dislikes || 0
//             }
//         });
//     } catch (error) {
//         next(error);
//     }
// }
//
// //Lajk i dislajk komentara
// export async function reactToComment(
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) {
//     try {
//         const commentId = Number(req.params.id);
//         const { type } = req.body;
//
//         if (!commentId) {
//             throw new AppError("Invalid comment id.", 400);
//         }
//
//         if (type !== "LIKE" && type !== "DISLIKE") {
//             throw new AppError("Reaction type must be LIKE or DISLIKE.", 400);
//         }
//
//         if (!req.visitorId) {
//             throw new AppError("Visitor session is missing.", 500);
//         }
//
//         const [commentRows] = await db.query(
//             `
//       SELECT id
//       FROM comments
//       WHERE id = ?
//       `,
//             [commentId]
//         );
//
//         if ((commentRows as { id: number }[]).length === 0) {
//             throw new AppError("Comment not found.", 404);
//         }
//
//         const [existingRows] = await db.query(
//             `
//       SELECT id, reaction_type
//       FROM comment_reactions
//       WHERE comment_id = ? AND visitor_id = ?
//       `,
//             [commentId, req.visitorId]
//         );
//
//         const existingReactions = existingRows as {
//             id: number;
//             reaction_type: "LIKE" | "DISLIKE";
//         }[];
//
//         if (existingReactions.length === 0) {
//             await db.query(
//                 `
//         INSERT INTO comment_reactions (comment_id, visitor_id, reaction_type)
//         VALUES (?, ?, ?)
//         `,
//                 [commentId, req.visitorId, type]
//             );
//         } else {
//             const existingReaction = existingReactions[0];
//
//             if (existingReaction.reaction_type === type) {
//                 await db.query(
//                     `
//           DELETE FROM comment_reactions
//           WHERE id = ?
//           `,
//                     [existingReaction.id]
//                 );
//             } else {
//                 await db.query(
//                     `
//           UPDATE comment_reactions
//           SET reaction_type = ?
//           WHERE id = ?
//           `,
//                     [type, existingReaction.id]
//                 );
//             }
//         }
//
//         const [countRows] = await db.query(
//             `
//       SELECT
//         SUM(CASE WHEN reaction_type = 'LIKE' THEN 1 ELSE 0 END) AS likes,
//         SUM(CASE WHEN reaction_type = 'DISLIKE' THEN 1 ELSE 0 END) AS dislikes
//       FROM comment_reactions
//       WHERE comment_id = ?
//       `,
//             [commentId]
//         );
//
//         const counts = (countRows as { likes: number | null; dislikes: number | null }[])[0];
//
//         return res.json({
//             message: "Comment reaction updated successfully.",
//             reactions: {
//                 likes: counts.likes || 0,
//                 dislikes: counts.dislikes || 0
//             }
//         });
//     } catch (error) {
//         next(error);
//     }
// }
//
// //Tagovi za vesti
// export async function getNewsByTag(
//     req: Request,
//     res: Response,
//     next: NextFunction
// ) {
//     try {
//         const tagName = String(req.params.tagName || "").trim();
//
//         if (!tagName) {
//             throw new AppError("Tag name is required.", 400);
//         }
//
//         const { page, limit, offset } = parsePagination(req);
//
//         const [tagRows] = await db.query(
//             `
//       SELECT id, name
//       FROM tags
//       WHERE name = ?
//       `,
//             [tagName]
//         );
//
//         const tags = tagRows as { id: number; name: string }[];
//
//         if (tags.length === 0) {
//             throw new AppError("Tag not found.", 404);
//         }
//
//         const tag = tags[0];
//
//         const [rows] = await db.query(
//             `
//       SELECT
//         n.id,
//         n.title,
//         n.text,
//         n.published_at,
//         n.visit_count,
//         n.author_id,
//         u.first_name AS author_first_name,
//         u.last_name AS author_last_name,
//         n.category_id,
//         c.name AS category_name
//       FROM news n
//       INNER JOIN news_tags nt ON nt.news_id = n.id
//       INNER JOIN tags t ON t.id = nt.tag_id
//       INNER JOIN users u ON u.id = n.author_id
//       INNER JOIN categories c ON c.id = n.category_id
//       WHERE t.id = ?
//       ORDER BY n.published_at DESC
//       LIMIT ? OFFSET ?
//       `,
//             [tag.id, limit, offset]
//         );
//
//         const [countRows] = await db.query(
//             `
//       SELECT COUNT(*) AS total
//       FROM news n
//       INNER JOIN news_tags nt ON nt.news_id = n.id
//       INNER JOIN tags t ON t.id = nt.tag_id
//       WHERE t.id = ?
//       `,
//             [tag.id]
//         );
//
//         const total = (countRows as { total: number }[])[0].total;
//
//         return res.json({
//             tag: {
//                 id: tag.id,
//                 name: tag.name
//             },
//             items: rows as NewsListItem[],
//             page,
//             limit,
//             total,
//             totalPages: Math.ceil(total / limit)
//         });
//     } catch (error) {
//         next(error);
//     }
// }