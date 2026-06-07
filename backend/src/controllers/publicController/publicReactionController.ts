import {NextFunction, Request, Response} from "express";
import {AppError} from "../../utils/AppError";
import {db} from "../../config/db";

//Reakcije na vesti
export async function reactToNews(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const newsId = Number(req.params.id);
        const { type } = req.body;

        if (!newsId) {
            throw new AppError("Invalid news id.", 400);
        }

        if (type !== "LIKE" && type !== "DISLIKE") {
            throw new AppError("Reaction type must be LIKE or DISLIKE.", 400);
        }

        if (!req.visitorId) {
            throw new AppError("Visitor session is missing.", 500);
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

        const [existingRows] = await db.query(
            `
      SELECT id, reaction_type
      FROM news_reactions
      WHERE news_id = ? AND visitor_id = ?
      `,
            [newsId, req.visitorId]
        );

        const existingReactions = existingRows as {
            id: number;
            reaction_type: "LIKE" | "DISLIKE";
        }[];

        if (existingReactions.length === 0) {
            await db.query(
                `
        INSERT INTO news_reactions (news_id, visitor_id, reaction_type)
        VALUES (?, ?, ?)
        `,
                [newsId, req.visitorId, type]
            );
        } else {
            const existingReaction = existingReactions[0];

            if (existingReaction.reaction_type === type) {
                await db.query(
                    `
          DELETE FROM news_reactions
          WHERE id = ?
          `,
                    [existingReaction.id]
                );
            } else {
                await db.query(
                    `
          UPDATE news_reactions
          SET reaction_type = ?
          WHERE id = ?
          `,
                    [type, existingReaction.id]
                );
            }
        }

        const [countRows] = await db.query(
            `
      SELECT
        SUM(CASE WHEN reaction_type = 'LIKE' THEN 1 ELSE 0 END) AS likes,
        SUM(CASE WHEN reaction_type = 'DISLIKE' THEN 1 ELSE 0 END) AS dislikes
      FROM news_reactions
      WHERE news_id = ?
      `,
            [newsId]
        );

        const counts = (countRows as { likes: number | null; dislikes: number | null }[])[0];

        return res.json({
            message: "News reaction updated successfully.",
            reactions: {
                likes: counts.likes || 0,
                dislikes: counts.dislikes || 0
            }
        });
    } catch (error) {
        next(error);
    }
}

//Reakcije na komentare
export async function reactToComment(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const commentId = Number(req.params.id);
        const { type } = req.body;

        if (!commentId) {
            throw new AppError("Invalid comment id.", 400);
        }

        if (type !== "LIKE" && type !== "DISLIKE") {
            throw new AppError("Reaction type must be LIKE or DISLIKE.", 400);
        }

        if (!req.visitorId) {
            throw new AppError("Visitor session is missing.", 500);
        }

        const [commentRows] = await db.query(
            `
      SELECT id
      FROM comments
      WHERE id = ?
      `,
            [commentId]
        );

        if ((commentRows as { id: number }[]).length === 0) {
            throw new AppError("Comment not found.", 404);
        }

        const [existingRows] = await db.query(
            `
      SELECT id, reaction_type
      FROM comment_reactions
      WHERE comment_id = ? AND visitor_id = ?
      `,
            [commentId, req.visitorId]
        );

        const existingReactions = existingRows as {
            id: number;
            reaction_type: "LIKE" | "DISLIKE";
        }[];

        if (existingReactions.length === 0) {
            await db.query(
                `
        INSERT INTO comment_reactions (comment_id, visitor_id, reaction_type)
        VALUES (?, ?, ?)
        `,
                [commentId, req.visitorId, type]
            );
        } else {
            const existingReaction = existingReactions[0];

            if (existingReaction.reaction_type === type) {
                await db.query(
                    `
          DELETE FROM comment_reactions
          WHERE id = ?
          `,
                    [existingReaction.id]
                );
            } else {
                await db.query(
                    `
          UPDATE comment_reactions
          SET reaction_type = ?
          WHERE id = ?
          `,
                    [type, existingReaction.id]
                );
            }
        }

        const [countRows] = await db.query(
            `
      SELECT
        SUM(CASE WHEN reaction_type = 'LIKE' THEN 1 ELSE 0 END) AS likes,
        SUM(CASE WHEN reaction_type = 'DISLIKE' THEN 1 ELSE 0 END) AS dislikes
      FROM comment_reactions
      WHERE comment_id = ?
      `,
            [commentId]
        );

        const counts = (countRows as { likes: number | null; dislikes: number | null }[])[0];

        return res.json({
            message: "Comment reaction updated successfully.",
            reactions: {
                likes: counts.likes || 0,
                dislikes: counts.dislikes || 0
            }
        });
    } catch (error) {
        next(error);
    }
}