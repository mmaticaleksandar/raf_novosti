import {NextFunction, Request, Response} from "express";
import {AppError} from "../../utils/AppError";
import {db} from "../../config/db";


//Pravljenje komentara
export async function createComment(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const newsId = Number(req.params.id);
        const { authorName, text } = req.body;

        if (!newsId) {
            throw new AppError("Invalid news id.", 400);
        }

        if (!authorName || !String(authorName).trim()) {
            throw new AppError("Comment author name is required.", 400);
        }

        if (!text || !String(text).trim()) {
            throw new AppError("Comment text is required.", 400);
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

        const normalizedAuthorName = String(authorName).trim();
        const normalizedText = String(text).trim();

        const [result] = await db.query(
            `
      INSERT INTO comments (news_id, author_name, text)
      VALUES (?, ?, ?)
      `,
            [newsId, normalizedAuthorName, normalizedText]
        );

        const insertResult = result as { insertId: number };

        return res.status(201).json({
            message: "Comment created successfully.",
            comment: {
                id: insertResult.insertId,
                newsId,
                authorName: normalizedAuthorName,
                text: normalizedText
            }
        });
    } catch (error) {
        next(error);
    }
}